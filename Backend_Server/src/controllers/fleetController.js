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