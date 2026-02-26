const db = require('../config/db');
const { getIO } = require('../config/socket');
const { predictBinOverflow } = require('../services/predictionEngine');
const { isPointInBoundary } = require('../services/boundaryValidator');
const { sendError } = require('../middleware/errorHelper');


// 1. GET ALL BINS
exports.getAllBins = async (req, res) => {
  try {
    const area_id = req.user.area_id;

    // Fetch bins with their last 48 hours of readings for prediction
    const result = await db.query(`
      SELECT 
        b.*,
        (
            SELECT json_agg(
                json_build_object(
                    'fill_percent', fill_percent,
                    'weight', weight, 
                    'recorded_at', recorded_at
                ) ORDER BY recorded_at DESC
            )
            FROM (
                SELECT fill_percent, weight, recorded_at
                FROM bin_readings 
                WHERE bin_id = b.id 
                AND recorded_at > NOW() - INTERVAL '48 hours'
                ORDER BY recorded_at DESC
            ) as readings
        ) as readings
      FROM bins b 
      WHERE b.area_id = $1 
      ORDER BY b.last_updated DESC
    `, [area_id]);

    // Calculate predictions for each bin
    const binsWithPredictions = result.rows.map(bin => {
      const readings = bin.readings || [];
      const prediction = predictBinOverflow(bin.id, readings);

      return {
        ...bin,
        prediction: {
          status: prediction.status,
          predicted_overflow_at: prediction.predicted_overflow_at,
          hours_until_overflow: prediction.hours_until_overflow
        }
      };
    });

    res.json(binsWithPredictions);
  } catch (err) {
    console.error(err);
    sendError(res, err, 'Get All Bins');
  }
};

// 2. CREATE BIN (with boundary validation)
exports.createBin = async (req, res) => {
  const { id, level, lat, lng, ward_id } = req.body;
  const area_id = req.user.area_id;

  try {
    // Validate coordinates are within the admin's area boundary
    const areaRes = await db.query('SELECT taluka FROM areas WHERE id = $1', [area_id]);
    if (areaRes.rows.length > 0) {
      const taluka = areaRes.rows[0].taluka;
      if (!isPointInBoundary(lat, lng, taluka)) {
        return res.status(400).json({
          error: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)}) is outside ${taluka} boundary. Cannot create bin outside your assigned area.`
        });
      }
    }

    const binIdToInsert = (id && id.trim() !== "") ? id : null;

    const newBin = await db.query(
      `INSERT INTO bins (id, area_id, latitude, longitude, current_fill_percent, status, ward_id, last_updated)
       VALUES (COALESCE($1, uuid_generate_v4()), $2, $3, $4, $5, 'NORMAL', $6, NOW())
       RETURNING *`,
      [binIdToInsert, area_id, lat, lng, level || 0, ward_id]
    );

    res.status(201).json({ success: true, bin: newBin.rows[0] });
  } catch (err) {
    console.error("Create Bin Error:", err);
    if (err.code === '22P02') {
      return res.status(400).json({ error: 'Invalid Bin ID Format.' });
    }
    sendError(res, err, 'Create Bin');
  }
};

// 3. IOT UPDATE
exports.updateBinReading = async (req, res) => {
  const { bin_id, fill_percent, lid_status, lid_angle, weight } = req.body;

  if (!bin_id || fill_percent === undefined) {
    return res.status(400).json({ success: false, message: 'Missing Data' });
  }

  const cleanBinId = bin_id.trim();

  try {
    // 1. Fetch the previous data to compare (Make sure to select 'status')
    const prevRes = await db.query(
      'SELECT current_fill_percent, current_weight, status FROM bins WHERE id = $1',
      [cleanBinId]
    );

    // Default to NORMAL if no previous data found
    const prevData = prevRes.rows[0] || { current_fill_percent: 0, current_weight: 0, status: 'NORMAL' };

    let status = 'NORMAL';

    // 2. Calculate differences
    const fillDiff = fill_percent - prevData.current_fill_percent;
    const weightDiff = weight - prevData.current_weight;

    // 3. Status Logic
    // Condition A: New Blockage Detected (Fill jumps > 20%, but weight change is small)
    // We use 100 as the weight threshold per your request
    const isNewBlockage = (fillDiff > 20 && Math.abs(weightDiff) < 100);

    // Condition B: Persisting Blockage (Was already BLOCKED and fill is still high)
    // This prevents it from flipping to 'CRITICAL' on the next heartbeat when fillDiff becomes 0
    const isPersistingBlockage = (prevData.status === 'BLOCKED' && fill_percent > 80);

    if (isNewBlockage || isPersistingBlockage) {
      status = 'BLOCKED';
    }
    else if (fill_percent >= 90) {
      status = 'CRITICAL';
    }
    else if (fill_percent >= 50) {
      status = 'FULL'; // Optional: Differentiate between 50% and 90%
    }

    // 4. Update the database
    await db.query(
      `UPDATE bins 
       SET current_fill_percent = $1, status = $2, lid_status = $3, lid_angle = $4, current_weight = $5, last_updated = NOW() 
       WHERE id = $6`,
      [fill_percent, status, lid_status || 'CLOSED', lid_angle || 0, weight || 0.00, cleanBinId]
    );

    // 4b. Log reading into bin_readings for analytics (Waste Collection Trends chart)
    await db.query(
      `INSERT INTO bin_readings (bin_id, fill_percent, weight, status, recorded_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [cleanBinId, fill_percent, weight || 0, status]
    );

    // 5. Emit Socket updates for the website
    const socket = getIO();
    if (socket) {
      socket.emit('bin_update', {
        id: cleanBinId,
        fill_percent,
        status,
        lid_status: lid_status || 'CLOSED',
        weight: weight || 0.0
      });

      // 6. Create Alert (Only if status CHANGED to Blocked/Critical to avoid spamming alerts on every heartbeat)
      if ((status === 'CRITICAL' || status === 'BLOCKED') && prevData.status !== status) {
        const alertMsg = status === 'BLOCKED'
          ? `Bin ${cleanBinId.substring(0, 8)} sensor BLOCKED (High Fill, Low Weight Change)!`
          : `Bin ${cleanBinId.substring(0, 8)} is CRITICAL (${fill_percent}%)`;

        const alertRes = await db.query(
          `INSERT INTO alerts (bin_id, message, severity, created_at) VALUES ($1, $2, 'HIGH', NOW()) RETURNING *`,
          [cleanBinId, alertMsg]
        );
        socket.emit('new_alert', alertRes.rows[0]);
      }
    }

    res.json({ success: true, status });

  } catch (err) {
    console.error("IoT Update Error:", err);
    sendError(res, err, 'IoT Update');
  }
};

// 4. MARK BIN AS COLLECTED (UPDATED FOR DRIVER ALERTS)
exports.markBinCollected = async (req, res) => {
  const { id } = req.params;
  const driverId = req.user.id;

  try {
    // A. Reset bin state
    await db.query(
      `UPDATE bins 
             SET current_fill_percent = 0, current_weight = 0, status = 'NORMAL', last_updated = NOW()
             WHERE id = $1`,
      [id]
    );

    // B. Log reading
    await db.query(
      `INSERT INTO bin_readings (bin_id, fill_percent, weight, status, recorded_at)
             VALUES ($1, 0, 0, 'NORMAL', NOW())`,
      [id]
    );

    const socket = getIO();

    // C. Alert: bin collected
    const binAlertMsg = `Bin collected by ${req.user.name || 'Driver'}`;
    const binAlertRes = await db.query(
      `INSERT INTO alerts (bin_id, message, severity, created_at)
             VALUES ($1, $2, 'INFO', NOW())
             RETURNING *`,
      [id, binAlertMsg]
    );

    if (socket) {
      socket.emit('new_alert', binAlertRes.rows[0]);
    }

    // D. Route logic: mark stop collected
    const updateStopRes = await db.query(
      `UPDATE route_stops rs
             SET status = 'COLLECTED', collected_at = NOW()
             FROM routes r
             WHERE rs.route_id = r.id
               AND r.driver_id = $1
               AND r.status = 'IN_PROGRESS'
               AND rs.bin_id = $2
               AND rs.status != 'COLLECTED'
             RETURNING rs.route_id`,
      [driverId, id]
    );

    // ✅ REAL-TIME ROUTE PROGRESS UPDATE (THIS IS WHAT YOU ASKED FOR)
    if (socket && updateStopRes.rows.length > 0) {
      socket.emit('route_update', {
        bin_id: id,
        status: 'COLLECTED',
        driver_id: driverId
      });
    }

    // E. Check if route is completed
    if (updateStopRes.rows.length > 0) {
      const routeId = updateStopRes.rows[0].route_id;

      const pendingCount = await db.query(
        `SELECT COUNT(*) FROM route_stops 
         WHERE route_id = $1 AND status != 'COLLECTED'`,
        [routeId]
      );

      if (parseInt(pendingCount.rows[0].count) === 0) {
        // 1. Mark the route as COMPLETED in the database
        await db.query(
          `UPDATE routes 
             SET status = 'COMPLETED', completed_at = NOW()
             WHERE id = $1`,
          [routeId]
        );

        // 2. Clear the driver's vehicle assignment
        await db.query(
          `UPDATE vehicles SET driver_id = NULL WHERE driver_id = $1`,
          [driverId]
        );

        // 3. Create a detailed alert message
        const driverName = req.user.name || 'Driver';
        const routeMsg = `Route #${routeId.substring(0, 8)} Completed. ${driverName} has finished all stops and is now AVAILABLE.`;

        const routeAlertRes = await db.query(
          `INSERT INTO alerts (bin_id, message, severity, created_at)
             VALUES (NULL, $1, 'SUCCESS', NOW())
             RETURNING *`,
          [routeMsg]
        );

        // 4. Send the alert and status updates via Socket.io
        if (socket) {
          socket.emit('new_alert', routeAlertRes.rows[0]); // Notifies the admin alert widget
          socket.emit('drivers_refresh');
          socket.emit('route_update', {
            route_id: routeId,
            status: 'COMPLETED',
            message: "Progress 100% complete"
          });
        }
      }
    }

    // F. Map update
    if (socket) {
      socket.emit('bin_update', {
        id,
        fill_percent: 0,
        weight: 0,
        status: 'NORMAL'
      });
    }

    res.json({ success: true, message: "Bin collected" });

  } catch (err) {
    console.error("Mark Bin Error:", err);
    sendError(res, err, 'Mark Bin Collected');
  }
};

// 5. UPDATE BIN CALIBRATION
exports.updateCalibration = async (req, res) => {
  try {
    const { id } = req.params;
    const { empty_distance, full_distance } = req.body;
    const result = await db.query(
      `UPDATE bins SET empty_distance = $1, full_distance = $2 WHERE id = $3 RETURNING *`,
      [empty_distance, full_distance, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bin not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Calibration Error:", err);
    sendError(res, err, 'Calibration');
  }
};

// 6. BIN HEALTH ANALYTICS
exports.getBinHealth = async (req, res) => {
  try {
    const area_id = req.user.area_id;

    // Get offline bins and their offline duration
    const offlineBins = await db.query(
      `SELECT id, 
              SUBSTRING(id::text, 1, 8) as short_id,
              latitude, longitude,
              status, 
              last_updated,
              EXTRACT(EPOCH FROM (NOW() - last_updated)) / 3600 as hours_offline
       FROM bins 
       WHERE area_id = $1
       ORDER BY last_updated ASC`,
      [area_id]
    );

    const bins = offlineBins.rows;
    const totalBins = bins.length;
    const offlineCount = bins.filter(b => b.status === 'OFFLINE').length;
    const staleCount = bins.filter(b => b.hours_offline > 24).length;
    const healthyCount = bins.filter(b => b.status !== 'OFFLINE' && b.hours_offline <= 24).length;

    // Flagged bins: offline OR stale (>24h since last update)
    const flaggedBins = bins
      .filter(b => b.status === 'OFFLINE' || b.hours_offline > 24)
      .map(b => ({
        id: b.id,
        short_id: b.short_id,
        status: b.status,
        hours_offline: Math.round(b.hours_offline * 10) / 10,
        last_updated: b.last_updated,
        needs_maintenance: b.hours_offline > 48
      }));

    res.json({
      totalBins,
      healthyCount,
      offlineCount,
      staleCount,
      reliabilityScore: totalBins > 0 ? Math.round((healthyCount / totalBins) * 100) : 100,
      flaggedBins
    });
  } catch (err) {
    console.error("Bin Health Error:", err);
    sendError(res, err, 'Bin Health');
  }
};
