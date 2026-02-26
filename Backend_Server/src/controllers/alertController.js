const db = require('../config/db');
const { sendError } = require('../middleware/errorHelper');
exports.getAlerts = async (req, res) => {
  try {
    const area_id = req.user.area_id;
    const result = await db.query(
      `SELECT a.* FROM alerts a
       LEFT JOIN bins b ON a.bin_id = b.id
       WHERE b.area_id = $1
       ORDER BY a.created_at DESC
       LIMIT 100`,
      [area_id]
    );
    res.json(result.rows);
  } catch (err) { sendError(res, err, 'Get Alerts'); }
};