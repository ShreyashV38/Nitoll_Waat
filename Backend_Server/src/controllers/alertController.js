const db = require('../config/db');
exports.getAlerts = async (req, res) => {
  try {
    const area_id = req.user.area_id;
    const result = await db.query(
      `SELECT a.* FROM alerts a
       LEFT JOIN bins b ON a.bin_id = b.id
       WHERE b.area_id = $1 OR a.bin_id IS NULL
       ORDER BY a.created_at DESC`,
      [area_id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Server Error' }); }
};