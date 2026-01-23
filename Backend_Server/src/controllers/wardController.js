const db = require('../config/db');

// Get all wards for the logged-in Admin's Area
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

// Create a new Ward (e.g., "Market Area")
exports.createWard = async (req, res) => {
  const { name } = req.body;
  const area_id = req.user.area_id;

  if (!name) return res.status(400).json({ message: 'Name required' });

  try {
    const newWard = await db.query(
      `INSERT INTO wards (id, area_id, name) VALUES (uuid_generate_v4(), $1, $2) RETURNING *`,
      [area_id, name]
    );
    res.status(201).json(newWard.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};