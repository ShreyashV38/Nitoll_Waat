const db = require('../config/db');
exports.getAreaById = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM areas WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Area not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Server Error' }); }
};