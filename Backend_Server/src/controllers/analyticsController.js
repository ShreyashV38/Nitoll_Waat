const db = require('../config/db');

// GET /api/analytics/waste-stats
exports.getWasteStats = async (req, res) => {
  try {
    const area_id = req.user.area_id;

    // 1. Weekly Waste Collection (Last 7 Days)
    // Aggregates the 'weight' column from bin_readings
    const weeklyQuery = `
      SELECT 
        TO_CHAR(recorded_at, 'Dy') as day, 
        SUM(weight) as total_weight
      FROM bin_readings 
      WHERE recorded_at >= NOW() - INTERVAL '7 days'
      GROUP BY 1, TO_CHAR(recorded_at, 'D')
      ORDER BY TO_CHAR(recorded_at, 'D') ASC;
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
      db.query(weeklyQuery),
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
    res.status(500).json({ error: 'Server Error' });
  }
};