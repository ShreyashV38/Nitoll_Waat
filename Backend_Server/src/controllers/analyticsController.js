const db = require('../config/db');
const { sendError } = require('../middleware/errorHelper');

// GET /api/analytics/waste-stats
exports.getWasteStats = async (req, res) => {
  try {
    const area_id = req.user.area_id;

    // 1. Weekly Waste Collection (Last 7 Days)
    // Aggregates the 'weight' column from bin_readings
    const weeklyQuery = `
      SELECT 
        TO_CHAR(br.recorded_at, 'Dy') as day, 
        SUM(br.weight) as total_weight
      FROM bin_readings br
      JOIN bins b ON br.bin_id = b.id
      WHERE br.recorded_at >= NOW() - INTERVAL '7 days'
        AND b.area_id = $1
      GROUP BY 1, TO_CHAR(br.recorded_at, 'D')
      ORDER BY TO_CHAR(br.recorded_at, 'D') ASC;
    `;

    // 2. Bin Status Distribution (Critical vs Normal vs Warning)
    const statusQuery = `
      SELECT status, COUNT(*) as count 
      FROM bins 
      WHERE area_id = $1 
      GROUP BY status
    `;

    // 3. Driver Efficiency (Completed Routes)
    const driverStatsQuery = `
        SELECT u.name, COUNT(r.id) as routes_completed
        FROM routes r
        JOIN users u ON r.driver_id = u.id
        WHERE r.area_id = $1 AND r.status = 'COMPLETED'
        GROUP BY u.name
        LIMIT 5
    `;

    const [weeklyRes, statusRes, driverRes] = await Promise.all([
      db.query(weeklyQuery, [area_id]),
      db.query(statusQuery, [area_id]),
      db.query(driverStatsQuery, [area_id])
    ]);

    res.json({
      weeklyWaste: weeklyRes.rows,
      binStatus: statusRes.rows,
      driverPerformance: driverRes.rows
    });

  } catch (err) {
    console.error("Analytics Error:", err);
    sendError(res, err, 'Analytics');
  }
};