const db = require('../config/db');
const { sendError } = require('../middleware/errorHelper');
const io = require('../config/socket'); // Ensure this is imported

// GET /api/driver/my-route
exports.getMyRoute = async (req, res) => {
  const driverId = req.user.id;

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
    sendError(res, err, 'Get My Route');
  }
};

// GET /api/driver/all (Admin view)
exports.getAllDrivers = async (req, res) => {
  try {
    const area_id = req.user.area_id;

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
    sendError(res, err, 'Get All Drivers');
  }
};

// POST /api/driver/complete-stop
exports.completeStop = async (req, res) => {
  const { stopId } = req.body;

  try {
    // 1. Mark Stop as Collected
    const result = await db.query(
      `UPDATE route_stops SET status = 'COLLECTED', collected_at = NOW() WHERE id = $1 RETURNING *`,
      [stopId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Stop not found' });
    }

    const routeId = result.rows[0].route_id;

    // 2. CHECK IF ROUTE IS COMPLETE (Automated Logic)
    const pendingCount = await db.query(
      `SELECT COUNT(*) FROM route_stops WHERE route_id = $1 AND status != 'COLLECTED'`,
      [routeId]
    );

    const remaining = parseInt(pendingCount.rows[0].count);

    if (remaining === 0) {
      // A. Close the Route
      await db.query(
        `UPDATE routes SET status = 'COMPLETED', completed_at = NOW() WHERE id = $1`,
        [routeId]
      );

      // B. Get Driver Info for Alert
      const driverRes = await db.query(
        `SELECT u.name, r.area_id FROM routes r JOIN users u ON r.driver_id = u.id WHERE r.id = $1`,
        [routeId]
      );
      const driverName = driverRes.rows[0]?.name || "Driver";

      // C. Alert Admin
      const alertMsg = `Route Completed by ${driverName}. Driver is now FREE.`;

      // ✅ FIX: Use 'RETURNING *' so we get the full alert object (id, timestamp)
      // ✅ FIX: Explicitly set bin_id to NULL to avoid SQL structure errors
      const alertRes = await db.query(
        `INSERT INTO alerts (bin_id, message, severity, created_at) VALUES (NULL, $1, 'INFO', NOW()) RETURNING *`,
        [alertMsg]
      );

      // D. Notify Admin Frontend
      const socket = io.getIO();
      if (socket) {
        // ✅ FIX: Send the actual database row so the frontend displays the correct time/ID
        socket.emit('new_alert', alertRes.rows[0]);
      }
    }

    res.json({ success: true, stop: result.rows[0], routeCompleted: remaining === 0 });
  } catch (err) {
    console.error("Complete Stop Error:", err);
    sendError(res, err, 'Complete Stop');
  }
};