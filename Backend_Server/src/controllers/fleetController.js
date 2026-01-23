const db = require('../config/db');

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

exports.getActiveRoutes = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.id, r.status, u.name as driver_name 
      FROM routes r 
      JOIN users u ON r.driver_id = u.id 
      WHERE r.status = 'IN_PROGRESS'
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Server Error' }); }
};

exports.addVehicle = async (req, res) => {
  const { license_plate, type } = req.body;
  const area_id = req.user.area_id; // Auto-detected from Token
  const driver_id = req.user.id;

  if (!license_plate || !type) {
    return res.status(400).json({ success: false, message: 'License Plate and Type are required' });
  }

  try {
    // 1. Insert Vehicle
    // We map "Mini Truck" -> 'OPEN_TRUCK' if needed, or store as is if ENUM allows.
    // Assuming ENUM values: 'OPEN_TRUCK', 'COMPACTOR', 'TIPPER' based on your schema snippet.
    const newVehicle = await db.query(
      `INSERT INTO vehicles (id, area_id, license_plate, type, status, created_at)
       VALUES (uuid_generate_v4(), $1, $2, $3, 'ACTIVE', NOW())
       RETURNING *`,
      [area_id, license_plate, type]
    );

    // OPTIONAL: Immediately link this vehicle to the driver in a "route" or just keep it in the fleet?
    // For now, we just register the vehicle.
    
    res.status(201).json({ success: true, vehicle: newVehicle.rows[0] });

  } catch (err) {
    console.error("Add Vehicle Error:", err);
    res.status(500).json({ success: false, message: 'Server Error: ' + err.message });
  }
};
exports.registerVehicle = async (req, res) => {
  const { license_plate, type } = req.body;
  const area_id = req.user.area_id; // Auto-detected from Token

  if (!license_plate || !type) {
    return res.status(400).json({ success: false, message: 'License Plate and Type are required' });
  }

  try {
    // Insert Vehicle with 'ACTIVE' status
    const newVehicle = await db.query(
      `INSERT INTO vehicles (id, area_id, license_plate, type, status, created_at)
       VALUES (uuid_generate_v4(), $1, $2, $3, 'ACTIVE', NOW())
       RETURNING *`,
      [area_id, license_plate, type] // $3 corresponds to your ENUM (OPEN_TRUCK, etc.)
    );

    res.status(201).json({ success: true, message: 'Vehicle Registered', vehicle: newVehicle.rows[0] });

  } catch (err) {
    console.error("Add Vehicle Error:", err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.createRoute = async (req, res) => {
  const { driver_id, ward_id, vehicle_id } = req.body;
  const area_id = req.user.area_id;

  if (!driver_id || !ward_id) {
    return res.status(400).json({ message: 'Driver and Ward are required' });
  }

  try {
    // 1. Check if Driver is already busy
    const busyCheck = await db.query(
      `SELECT * FROM routes WHERE driver_id = $1 AND status = 'IN_PROGRESS'`,
      [driver_id]
    );
    if (busyCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Driver is already assigned to another route!' });
    }

    // 2. Create Route
    const newRoute = await db.query(
      `INSERT INTO routes (id, area_id, driver_id, ward_id, vehicle_id, status, created_at)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, 'IN_PROGRESS', NOW())
       RETURNING *`,
      [area_id, driver_id, ward_id, vehicle_id || null]
    );

    res.status(201).json({ success: true, route: newRoute.rows[0] });

  } catch (err) {
    console.error("Create Route Error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// NEW: Automatically generate daily routes for all active drivers
exports.generateAutoRoutes = async (req, res) => {
  const area_id = req.user.area_id;

  try {
    // 1. Find all drivers who have a registered vehicle and an assigned ward
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

    // 2. Create Route logs for today
    for (let row of availableDrivers.rows) {
      await db.query(
        `INSERT INTO routes (id, area_id, driver_id, vehicle_id, ward_id, status, created_at)
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, 'IN_PROGRESS', NOW())
         ON CONFLICT (driver_id, route_date) DO NOTHING`, 
         [area_id, row.driver_id, row.vehicle_id, row.ward_id]
      );
    }

    res.status(201).json({ success: true, message: "Daily routes generated and drivers dispatched." });
  } catch (err) {
    console.error("Auto Dispatch Error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
};