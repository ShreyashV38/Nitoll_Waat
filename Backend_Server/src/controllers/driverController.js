const db = require('../config/db');

// GET /api/driver/my-route
exports.getMyRoute = async (req, res) => {
  const driverId = req.user.id; // Comes from authMiddleware

  try {
    const routeQuery = `SELECT * FROM routes WHERE driver_id = $1 AND status = 'IN_PROGRESS' LIMIT 1`;
    const routeRes = await db.query(routeQuery, [driverId]);

    if (routeRes.rows.length === 0) {
      return res.status(404).json({ message: 'No active route found' });
    }

    const route = routeRes.rows[0];

    const stopsQuery = `
        SELECT rs.*, b.latitude, b.longitude, b.current_fill_percent 
        FROM route_stops rs
        JOIN bins b ON rs.bin_id = b.id
        WHERE rs.route_id = $1
        ORDER BY rs.sequence_order ASC
    `;
    const stopsRes = await db.query(stopsQuery, [route.id]);

    res.json({
      route: route,
      stops: stopsRes.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

// POST /api/driver/complete-stop
exports.completeStop = async (req, res) => {
  const { stopId } = req.body;

  try {
    const result = await db.query(
      `UPDATE route_stops SET status = 'COLLECTED', collected_at = NOW() WHERE id = $1 RETURNING *`,
      [stopId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Stop not found' });
    }

    res.json({ success: true, stop: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};


//

exports.getAllDrivers = async (req, res) => {
  try {
    const area_id = req.user.area_id;

    // FIX: Removed 'status' column from users table.
    // ADDED: Logic to check if they are BUSY based on active routes.
    const result = await db.query(
      `SELECT 
         u.id, 
         u.name, 
         u.email, 
         u.mobile,
         CASE 
           WHEN r.id IS NOT NULL THEN 'BUSY' 
           ELSE 'AVAILABLE' 
         END as status
       FROM users u
       LEFT JOIN routes r ON u.id = r.driver_id AND r.status = 'IN_PROGRESS'
       WHERE u.role = 'DRIVER' AND u.area_id = $1`,
      [area_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get All Drivers Error:", err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};