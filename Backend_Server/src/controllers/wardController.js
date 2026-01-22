const db = require('../config/db');

// GET all wards for the logged-in Admin's Area
exports.getWards = async (req, res) => {
  try {
    const area_id = req.user.area_id;
    const result = await db.query('SELECT * FROM wards WHERE area_id = $1 ORDER BY name', [area_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

// CREATE a new Ward
exports.createWard = async (req, res) => {
  const { name, description } = req.body;
  const area_id = req.user.area_id;

  try {
    const newWard = await db.query(
      `INSERT INTO wards (id, area_id, name, description) VALUES (uuid_generate_v4(), $1, $2, $3) RETURNING *`,
      [area_id, name, description]
    );
    res.status(201).json(newWard.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};