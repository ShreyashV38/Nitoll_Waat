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
    console.log(`\n=== Generating Route for Area: ${area_id} ===`);
    
    // 1. Get Dumping Zone Info
    const zoneRes = await db.query('SELECT * FROM dumping_zones WHERE id = $1', [dumping_zone_id]);
    if (zoneRes.rows.length === 0) {
      return res.status(404).json({ message: "Dumping Zone not found" });
    }
    const dumpingZone = zoneRes.rows[0];

    // 2. Get ALL Bins with their 48-hour reading history
    // This is CRITICAL - we need historical data for prediction
    const binsRes = await db.query(`
      SELECT 
        b.id, 
        b.latitude, 
        b.longitude, 
        b.current_fill_percent,
        b.current_weight,
        COALESCE(w.name, 'Bin ' || substring(b.id::text, 1, 6)) as area_name,
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
                LIMIT 100
            ) as readings
        ) as readings
      FROM bins b
      LEFT JOIN wards w ON b.ward_id = w.id
      WHERE b.area_id = $1 
      AND b.latitude IS NOT NULL 
      AND b.longitude IS NOT NULL
      ORDER BY b.current_fill_percent DESC
    `, [area_id]);

    console.log(`Found ${binsRes.rows.length} bins in the area`);

    if (binsRes.rows.length === 0) {
      return res.status(400).json({ 
        message: "No bins found in your area", 
        success: false 
      });
    }

    // 3. Process bins and ensure readings are arrays
    const processedBins = binsRes.rows.map(bin => {
      // Convert readings from JSON to array
      let readings = [];
      if (bin.readings) {
        readings = Array.isArray(bin.readings) ? bin.readings : JSON.parse(bin.readings);
      }
      
      return {
        ...bin,
        readings: readings,
        current_fill_percent: bin.current_fill_percent || 0
      };
    });

    // 4. Run Prediction & Optimization Engine
    const startLoc = { 
      latitude: parseFloat(latitude), 
      longitude: parseFloat(longitude) 
    };
    
    const endLoc = { 
      latitude: parseFloat(dumpingZone.latitude), 
      longitude: parseFloat(dumpingZone.longitude), 
      name: dumpingZone.name 
    };
    
    const optimizationResult = routeEngine.generateRoute(startLoc, endLoc, processedBins);

    // 5. Log summary
    console.log(`\n=== Route Summary ===`);
    console.log(`Total stops: ${optimizationResult.meta.total_stops}`);
    console.log(`Bins to collect: ${optimizationResult.meta.bins_to_collect}`);
    console.log(`  - Critical now: ${optimizationResult.meta.critical_now}`);
    console.log(`  - Predicted soon: ${optimizationResult.meta.predicted_soon}`);
    console.log(`Blocked bins: ${optimizationResult.meta.bins_blocked}`);
    console.log(`Monitored bins: ${optimizationResult.meta.bins_monitored}`);

    res.json({ 
      success: true, 
      data: optimizationResult,
      summary: {
        message: `Route includes ${optimizationResult.meta.bins_to_collect} bins (${optimizationResult.meta.critical_now} critical now, ${optimizationResult.meta.predicted_soon} will overflow soon)`,
        collection_window: "24 hours"
      }
    });

  } catch (err) {
    console.error("Route Generation Error:", err); 
    res.status(500).json({ 
      message: "Server Error", 
      details: err.message 
    });
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
      const readings = bin.readings || [];
      const analysis = predictBinOverflow(bin.id, readings);
      
      // Only include bins that need attention
      if (['CRITICAL', 'CRITICAL_SOON', 'PREDICTED_OVERFLOW', 'BLOCKED_VIEW'].includes(analysis.status)) {
        binPredictions.push({
          bin_id: bin.id,
          ward_name: bin.ward_name,
          current_fill: analysis.current_fill,
          status: analysis.status,
          predicted_overflow_at: analysis.predicted_overflow_at,
          hours_until_overflow: analysis.hours_until_overflow,
          confidence: analysis.confidence
        });
      }
    });

    // Sort by urgency
    binPredictions.sort((a, b) => {
      const priorityA = a.hours_until_overflow || 999;
      const priorityB = b.hours_until_overflow || 999;
      return priorityA - priorityB;
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

// src/controllers/fleetController.js

exports.ignoreBin = async (req, res) => {
    // 1. Remove the duplicate variable declaration
    const { bin_id, reason } = req.body;

    try {
        // 2. FIXED QUERY:
        // - Removed manual "id" insertion (Let the database auto-generate it)
        // - Removed "type" column (It likely doesn't exist in your table, based on other controllers)
        const alertRes = await db.query(
            `INSERT INTO alerts (bin_id, message, severity, created_at)
             VALUES ($1, $2, 'MEDIUM', NOW())
             RETURNING *`,
            [bin_id, `Skipped: ${reason}`]
        );

        // 3. Notify Website
        const io = require('../config/socket').getIO();
        io.emit('new_alert', alertRes.rows[0]); // Changed 'newAlert' to 'new_alert' to match other controllers

        res.json({ success: true });

    } catch (e) { 
        console.error("Ignore Bin Error:", e); // Log the actual error to your terminal
        res.status(500).json({ error: e.message }); 
    }
};
// src/controllers/fleetController.js

// ... existing code ...

// 9. ASSIGN DRIVER TO VEHICLE
exports.assignVehicle = async (req, res) => {
  const { vehicle_id, driver_id } = req.body;

  if (!vehicle_id || !driver_id) {
    return res.status(400).json({ message: "Vehicle ID and Driver ID are required" });
  }

  try {
    // Optional: Check if driver is already assigned to another active vehicle
    // const checkDriver = await db.query('SELECT * FROM vehicles WHERE driver_id = $1 AND id != $2', [driver_id, vehicle_id]);
    // if (checkDriver.rows.length > 0) return res.status(400).json({ message: "Driver is already assigned to another vehicle" });

    // 1. Unassign this driver from any other vehicles first (Enforce 1-to-1 relationship)
    await db.query(`UPDATE vehicles SET driver_id = NULL WHERE driver_id = $1`, [driver_id]);

    // 2. Assign driver to the new vehicle
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