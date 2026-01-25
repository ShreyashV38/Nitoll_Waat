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

// 2. GET ACTIVE ROUTES (For Admin Dashboard) <-- RESTORED THIS FUNCTION
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
// Alias for backward compatibility if needed
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

    res.status(201).json({ success: true, route: newRoute.rows[0] });

  } catch (err) {
    console.error("Create Route Error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 5. AUTO DISPATCH (Daily Start)
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
      // Skip if ward_id is NULL (Driver hasn't selected a ward yet)
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

    // USING THE FIX: LEFT JOIN so route shows even if ward is missing
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

  if (!latitude || !longitude || !dumping_zone_id) {
    return res.status(400).json({ message: "Location and Dumping Zone required" });
  }

  try {
    // 1. Get Dumping Zone Info
    const zoneRes = await db.query('SELECT * FROM dumping_zones WHERE id = $1', [dumping_zone_id]);
    if (zoneRes.rows.length === 0) return res.status(404).json({ message: "Dumping Zone not found" });
    const dumpingZone = zoneRes.rows[0];

    // 2. Get Bins + History (FIXED SQL QUERY)
    // FIX 1: Changed 'fill_level' to 'fill_percent' (matches bin_readings table)
    // FIX 2: Added fallback for current fill if readings are empty
    const binsRes = await db.query(`
      SELECT 
        b.id, 
        b.latitude, 
        b.longitude, 
        b.current_fill_percent, -- ✅ Get current status directly from bin
        COALESCE(w.name, 'Bin ' || substring(b.id::text, 1, 6)) as area_name,
        (
            SELECT json_agg(json_build_object(
                'fill_percent', fill_percent,  -- ✅ CHANGED from fill_level
                'weight', weight, 
                'recorded_at', recorded_at
            ))
            FROM (
                SELECT fill_percent, weight, recorded_at  -- ✅ CHANGED from fill_level
                FROM bin_readings 
                WHERE bin_id = b.id AND recorded_at > NOW() - INTERVAL '48 hours'
                ORDER BY recorded_at DESC
            ) as readings
        ) as readings
      FROM bins b
      LEFT JOIN wards w ON b.ward_id = w.id
      WHERE b.area_id = $1
    `, [area_id]);

    // 3. Run Optimization Engine
    const startLoc = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
    const endLoc = { 
        latitude: parseFloat(dumpingZone.latitude), 
        longitude: parseFloat(dumpingZone.longitude), 
        name: dumpingZone.name 
    };
    
    // Pass the raw rows. The Route Engine will handle the logic.
    const optimizationResult = routeEngine.generateRoute(startLoc, endLoc, binsRes.rows);

    res.json({ success: true, data: optimizationResult });

  } catch (err) {
    console.error("Optimization Error:", err); 
    res.status(500).json({ message: "Server Error", details: err.message });
  }
};

exports.ignoreBin = async (req, res) => {
    const { bin_id, reason } = req.body;
    try {
        await db.query(
            `INSERT INTO alerts (id, bin_id, type, message, severity, created_at)
             VALUES (uuid_generate_v4(), $1, 'COLLECTION_SKIPPED', $2, 'MEDIUM', NOW())`,
            [bin_id, `Skipped: ${reason}`]
        );
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
};