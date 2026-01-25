const routeEngine = require('../services/routeEngine');
const db = require('../config/db');

// 1. GET VEHICLES (For Admin Fleet View)
exports.getVehicles = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT v.*, u.name as driver_name 
      FROM vehicles v 
      LEFT JOIN routes r ON v.id = r.vehicle_id AND r.status = 'IN_PROGRESS'
      LEFT JOIN users u ON r.driver_id = u.id
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Server Error' }); }
};

// 2. GET ACTIVE ROUTES (For Admin Dashboard)
exports.getActiveRoutes = async (req, res) => {
  try {
    const area_id = req.user.area_id; 
    const result = await db.query(`
      SELECT 
        r.id, 
        r.status, 
        u.name as driver_name,
        v.license_plate,
        w.name as ward_name,
        (SELECT COUNT(*) FROM route_stops WHERE route_id = r.id) as total_stops,
        (SELECT COUNT(*) FROM route_stops WHERE route_id = r.id AND status = 'COLLECTED') as completed_stops
      FROM routes r 
      JOIN users u ON r.driver_id = u.id 
      LEFT JOIN vehicles v ON r.vehicle_id = v.id
      JOIN wards w ON r.ward_id = w.id
      WHERE r.status = 'IN_PROGRESS' AND r.area_id = $1
    `, [area_id]);
    res.json(result.rows);
  } catch (err) { 
    console.error(err);
    res.status(500).json({ error: 'Server Error' }); 
  }
};

// 3. REGISTER VEHICLE
exports.registerVehicle = async (req, res) => {
  const { license_plate, type } = req.body;
  const area_id = req.user.area_id; 

  if (!license_plate || !type) {
    return res.status(400).json({ success: false, message: 'License Plate and Type are required' });
  }

  try {
    const newVehicle = await db.query(
      `INSERT INTO vehicles (id, area_id, license_plate, type, status, created_at)
       VALUES (uuid_generate_v4(), $1, $2, $3, 'ACTIVE', NOW())
       RETURNING *`,
      [area_id, license_plate, type]
    );

    res.status(201).json({ success: true, message: 'Vehicle Registered', vehicle: newVehicle.rows[0] });

  } catch (err) {
    console.error("Add Vehicle Error:", err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
exports.addVehicle = exports.registerVehicle;

// 4. CREATE ROUTE (Manual Assign)
exports.createRoute = async (req, res) => {
  const { driver_id, ward_id, vehicle_id } = req.body;
  const area_id = req.user.area_id;

  if (!driver_id || !ward_id) {
    return res.status(400).json({ message: 'Driver and Ward are required' });
  }

  try {
    const busyCheck = await db.query(
      `SELECT * FROM routes WHERE driver_id = $1 AND status = 'IN_PROGRESS'`,
      [driver_id]
    );
    if (busyCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Driver is already assigned to another route!' });
    }

    const newRoute = await db.query(
      `INSERT INTO routes (id, area_id, driver_id, ward_id, vehicle_id, status, route_date, created_at)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, 'IN_PROGRESS', CURRENT_DATE, NOW())
       RETURNING *`,
      [area_id, driver_id, ward_id, vehicle_id || null]
    );

    await db.query(
        `UPDATE users SET assigned_ward_id = $1 WHERE id = $2`,
        [ward_id, driver_id]
    );

    res.status(201).json({ success: true, route: newRoute.rows[0] });

  } catch (err) {
    console.error("Create Route Error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 5. AUTO DISPATCH
exports.generateAutoRoutes = async (req, res) => {
  const area_id = req.user.area_id;

  try {
    const availableDrivers = await db.query(
      `SELECT u.id as driver_id, v.id as vehicle_id, u.assigned_ward_id as ward_id
       FROM users u 
       JOIN vehicles v ON u.id = v.driver_id 
       WHERE u.role = 'DRIVER' AND v.status = 'ACTIVE' AND u.area_id = $1`,
      [area_id]
    );

    if (availableDrivers.rows.length === 0) {
      return res.status(400).json({ message: "No active drivers with registered vehicles found." });
    }

    for (let row of availableDrivers.rows) {
      if (!row.ward_id) continue;

      await db.query(
        `INSERT INTO routes (id, area_id, driver_id, vehicle_id, ward_id, status, route_date, created_at)
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, 'IN_PROGRESS', CURRENT_DATE, NOW())
         ON CONFLICT (driver_id, route_date) DO NOTHING`, 
         [area_id, row.driver_id, row.vehicle_id, row.ward_id]
      );
    }

    res.status(201).json({ success: true, message: "Daily routes generated." });
  } catch (err) {
    console.error("Auto Dispatch Error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 6. CANCEL ROUTE
exports.cancelRoute = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `UPDATE routes SET status = 'CANCELLED' WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    const route = result.rows[0];
    if (route.driver_id) {
        await db.query(
            `UPDATE users SET assigned_ward_id = NULL WHERE id = $1`,
            [route.driver_id]
        );
    }

    res.json({ success: true, message: 'Route removed successfully', route: result.rows[0] });
  } catch (err) {
    console.error("Cancel Route Error:", err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// 7. GET ACTIVE ROUTE (For Driver App)
exports.getDriverActiveRoute = async (req, res) => {
  try {
    const driver_id = req.user.id; 
    const query = `
      SELECT 
        r.id as route_id,
        r.status,
        COALESCE(w.name, 'Unassigned Ward') as ward_name, 
        v.license_plate,
        (SELECT COUNT(*) FROM route_stops rs WHERE rs.route_id = r.id) as total_bins,
        (SELECT COUNT(*) FROM route_stops rs WHERE rs.route_id = r.id AND rs.status::text = 'PENDING') as pending_bins
      FROM routes r
      LEFT JOIN wards w ON r.ward_id = w.id 
      JOIN vehicles v ON r.vehicle_id = v.id
      WHERE r.driver_id = $1 
      AND r.status::text IN ('ASSIGNED', 'IN_PROGRESS') 
      AND r.route_date = CURRENT_DATE
      LIMIT 1;
    `;
    const result = await db.query(query, [driver_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No active route assigned for today." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get Driver Route Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// 8. GENERATE OPTIMIZED ROUTE FOR DRIVER
exports.generateOptimizedRoute = async (req, res) => {
  const { latitude, longitude, dumping_zone_id } = req.body;
  const area_id = req.user.area_id;
  const driver_id = req.user.id;

  if (!latitude || !longitude || !dumping_zone_id) {
    return res.status(400).json({ message: "Location and Dumping Zone required" });
  }

  try {
    // 1. Get Driver's Assigned Ward
    const driverRes = await db.query(
        `SELECT assigned_ward_id FROM users WHERE id = $1`, 
        [driver_id]
    );
    const assignedWardId = driverRes.rows[0]?.assigned_ward_id;

    if (!assignedWardId) {
        return res.status(400).json({ message: "You are not assigned to any ward." });
    }

    // 2. Get Dumping Zone
    const zoneRes = await db.query('SELECT * FROM dumping_zones WHERE id = $1', [dumping_zone_id]);
    if (zoneRes.rows.length === 0) return res.status(404).json({ message: "Dumping Zone not found" });
    const dumpingZone = zoneRes.rows[0];

    // 3. Get Bins
    const binsRes = await db.query(`
      SELECT b.id, b.latitude, b.longitude, b.current_fill_percent, b.current_weight,
      (SELECT json_agg(json_build_object('fill_percent', fill_percent, 'recorded_at', recorded_at) ORDER BY recorded_at DESC)
       FROM (SELECT fill_percent, recorded_at FROM bin_readings WHERE bin_id = b.id LIMIT 50) as readings
      ) as readings
      FROM bins b
      WHERE b.area_id = $1 AND b.ward_id = $2
      AND b.latitude IS NOT NULL AND b.longitude IS NOT NULL
      ORDER BY b.current_fill_percent DESC
    `, [area_id, assignedWardId]);

    if (binsRes.rows.length === 0) {
      return res.status(400).json({ success: false, message: "No bins found in your ward" });
    }

    // 4. Process Bins & Generate Route
    const processedBins = binsRes.rows.map(bin => ({
      ...bin,
      readings: bin.readings || [],
      current_fill_percent: bin.current_fill_percent || 0
    }));

    const startLoc = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
    const endLoc = { latitude: parseFloat(dumpingZone.latitude), longitude: parseFloat(dumpingZone.longitude), name: dumpingZone.name };
    
    // Generate route using custom engine
    const optimizationResult = routeEngine.generateRoute(startLoc, endLoc, processedBins);

    // ============================================================
    // ✅ NEW STEP: SAVE STOPS TO DATABASE FOR TRACKING
    // ============================================================
    
    const routeCheck = await db.query(
        `SELECT id FROM routes WHERE driver_id = $1 AND status = 'IN_PROGRESS' LIMIT 1`,
        [driver_id]
    );

    if (routeCheck.rows.length > 0) {
        const routeId = routeCheck.rows[0].id;
        const binsToCollect = optimizationResult.route_points; 

        // Clear old stops
        await db.query(`DELETE FROM route_stops WHERE route_id = $1 AND status = 'PENDING'`, [routeId]);

        // Insert new stops (FIXED: Added sequence_order)
        for (let i = 0; i < binsToCollect.length; i++) {
            const stop = binsToCollect[i];
            
            if (stop.type === 'COLLECTION_POINT') { 
                await db.query(
                    `INSERT INTO route_stops (id, route_id, bin_id, status, sequence_order)
                     VALUES (uuid_generate_v4(), $1, $2, 'PENDING', $3)
                     ON CONFLICT DO NOTHING`,
                    [routeId, stop.bin_id, i + 1] // ✅ Passing 'i + 1' as the sequence order
                );
            }
        }
        
        const io = require('../config/socket').getIO();
        if(io) io.emit('route_update', { message: 'New route generated' });
    }
    // ============================================================

    res.json({ 
      success: true, 
      data: optimizationResult,
      summary: { message: "Route generated and saved.", bins: optimizationResult.meta.bins_to_collect }
    });

  } catch (err) {
    console.error("Route Generation Error:", err); 
    res.status(500).json({ message: "Server Error", details: err.message });
  }
};

// HELPER: Get bins that need collection
exports.getBinsNeedingCollection = async (req, res) => {
  try {
    const area_id = req.user.area_id;

    const binsRes = await db.query(`
      SELECT 
        b.id, 
        b.current_fill_percent,
        b.current_weight,
        COALESCE(w.name, 'Unknown') as ward_name,
        (
            SELECT json_agg(
                json_build_object(
                    'fill_percent', fill_percent,
                    'weight', weight, 
                    'recorded_at', recorded_at
                )
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
      LEFT JOIN wards w ON b.ward_id = w.id
      WHERE b.area_id = $1
    `, [area_id]);

    const binPredictions = [];

    binsRes.rows.forEach(bin => {
      const isCritical = bin.current_fill_percent >= 50; 
      
      if (isCritical) {
        binPredictions.push({
          bin_id: bin.id,
          ward_name: bin.ward_name,
          current_fill: bin.current_fill_percent,
          status: 'CRITICAL',
          confidence: 'HIGH'
        });
      }
    });

    res.json({
      bins: binPredictions,
      total: binPredictions.length
    });

  } catch (err) {
    console.error("Get Bins Error:", err);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.ignoreBin = async (req, res) => {
    const { bin_id, reason } = req.body;
    try {
        const alertRes = await db.query(
            `INSERT INTO alerts (bin_id, message, severity, created_at)
             VALUES ($1, $2, 'MEDIUM', NOW())
             RETURNING *`,
            [bin_id, `Skipped: ${reason}`]
        );

        const io = require('../config/socket').getIO();
        if(io) io.emit('new_alert', alertRes.rows[0]);

        res.json({ success: true });
    } catch (e) { 
        console.error("Ignore Bin Error:", e);
        res.status(500).json({ error: e.message }); 
    }
};

exports.assignVehicle = async (req, res) => {
  const { vehicle_id, driver_id } = req.body;

  if (!vehicle_id) {
    return res.status(400).json({ message: "Vehicle ID is required" });
  }

  try {
    if (!driver_id) {
        const result = await db.query(
            `UPDATE vehicles SET driver_id = NULL WHERE id = $1 RETURNING *`,
            [vehicle_id]
        );
        return res.json({ 
            success: true, 
            message: "Driver unassigned successfully", 
            vehicle: result.rows[0] 
        });
    }

    await db.query(`UPDATE vehicles SET driver_id = NULL WHERE driver_id = $1`, [driver_id]);

    const result = await db.query(
      `UPDATE vehicles SET driver_id = $1 WHERE id = $2 RETURNING *`,
      [driver_id, vehicle_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json({ 
      success: true, 
      message: "Driver assigned successfully", 
      vehicle: result.rows[0] 
    });

  } catch (err) {
    console.error("Assign Vehicle Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};