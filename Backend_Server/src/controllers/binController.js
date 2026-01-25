const db = require('../config/db');
const { getIO } = require('../config/socket');

// 1. GET ALL BINS
exports.getAllBins = async (req, res) => {
  try {
    const area_id = req.user.area_id; 
    const result = await db.query(
      'SELECT * FROM bins WHERE area_id = $1 ORDER BY last_updated DESC', 
      [area_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

// 2. CREATE BIN
exports.createBin = async (req, res) => {
  const { id, level, lat, lng, ward_id } = req.body; 
  const area_id = req.user.area_id;

  try {
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
    res.status(500).json({ error: 'Server Error' });
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
    const prevRes = await db.query(
        'SELECT current_fill_percent, current_weight FROM bins WHERE id = $1', 
        [cleanBinId]
    );
    const prevData = prevRes.rows[0] || { current_fill_percent: 0, current_weight: 0 };

    let status = 'NORMAL';
    const fillDiff = fill_percent - prevData.current_fill_percent;
    const weightDiff = Math.abs(weight - prevData.current_weight);

    if (fillDiff > 20 && weightDiff < 0.20) {
        status = 'BLOCKED';
    } else if (fill_percent >= 50) {
        status = 'CRITICAL'; 
    }

    await db.query(
      `UPDATE bins 
       SET current_fill_percent = $1, status = $2, lid_status = $3, lid_angle = $4, current_weight = $5, last_updated = NOW() 
       WHERE id = $6`,
      [fill_percent, status, lid_status || 'CLOSED', lid_angle || 0, weight || 0.00, cleanBinId]
    );  

    await db.query(
      `INSERT INTO bin_readings (bin_id, fill_percent, status, weight, lid_status, lid_angle, recorded_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [cleanBinId, fill_percent, status, weight || 0.00, lid_status || 'CLOSED', lid_angle || 0]
    );

    const socket = getIO();
    if(socket) {
      socket.emit('bin_update', { 
          id: cleanBinId, 
          fill_percent, 
          status, 
          lid_status: lid_status || 'CLOSED', 
          weight: weight || 0.0 
      });

      if (status === 'CRITICAL' || status === 'BLOCKED') {
        const alertMsg = status === 'BLOCKED' 
            ? `Bin ${cleanBinId.substring(0,8)} sensor BLOCKED!`
            : `Bin ${cleanBinId.substring(0,8)} is CRITICAL (${fill_percent}%)`;

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
    res.status(500).json({ error: err.message });
  }
};

// 4. MARK BIN AS COLLECTED (UPDATED FOR DRIVER ALERTS)
exports.markBinCollected = async (req, res) => {
    const { id } = req.params; // Bin ID
    const driverId = req.user.id; // Driver ID from auth token

    try {
        // A. Reset 'bins' Table
        await db.query(
            `UPDATE bins SET current_fill_percent = 0, current_weight = 0, status = 'NORMAL', last_updated = NOW() 
             WHERE id = $1`, 
            [id]
        );

        // B. Log History
        await db.query(
            `INSERT INTO bin_readings (bin_id, fill_percent, weight, status, recorded_at)
             VALUES ($1, 0, 0, 'NORMAL', NOW())`,
            [id]
        );

        const socket = getIO();

        // C. ALERT: Notify Admin that Bin was collected
        const binAlertMsg = `Bin collected by ${req.user.name || 'Driver'}`;
        const binAlertRes = await db.query(
             `INSERT INTO alerts (bin_id, message, severity, created_at) 
              VALUES ($1, $2, 'INFO', NOW()) 
              RETURNING *`,
             [id, binAlertMsg]
        );
        if (socket) socket.emit('new_alert', binAlertRes.rows[0]);

        // D. ROUTE LOGIC: Update Route Status & Check Completion
        // Find the active route stop for this driver + bin and mark it collected
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

        // If a route stop was actually updated, check if the whole route is done
        if (updateStopRes.rows.length > 0) {
            const routeId = updateStopRes.rows[0].route_id;

            const pendingCount = await db.query(
                `SELECT COUNT(*) FROM route_stops WHERE route_id = $1 AND status != 'COLLECTED'`,
                [routeId]
            );

            if (parseInt(pendingCount.rows[0].count) === 0) {
                // Route Complete: Close it
                await db.query(
                    `UPDATE routes SET status = 'COMPLETED', completed_at = NOW() WHERE id = $1`,
                    [routeId]
                );

                // Alert: Driver is Free
                const routeMsg = `Route Completed. ${req.user.name} is now AVAILABLE.`;
                const routeAlertRes = await db.query(
                    `INSERT INTO alerts (bin_id, message, severity, created_at) 
                     VALUES (NULL, $1, 'SUCCESS', NOW()) 
                     RETURNING *`,
                    [routeMsg]
                );

                if (socket) {
                    socket.emit('new_alert', routeAlertRes.rows[0]);
                    socket.emit('drivers_refresh'); // Tell frontend to refresh driver list
                }
            }
        }

        // E. Notify Frontend of Bin Reset (Map Update)
        if (socket) {
            socket.emit('bin_update', {
                id: id,
                fill_percent: 0,
                status: 'NORMAL',
                weight: 0
            });
        }

        res.json({ success: true, message: "Bin collected" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
};