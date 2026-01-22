const db = require('../config/db');
exports.getAlerts = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM alerts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Server Error' }); }
};