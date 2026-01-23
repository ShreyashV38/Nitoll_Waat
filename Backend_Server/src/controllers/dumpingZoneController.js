const db = require('../config/db');

// GET all zones for the area
exports.getZones = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM dumping_zones WHERE area_id = $1', [req.user.area_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

// CREATE a new zone
exports.createZone = async (req, res) => {
  const { name, lat, lng } = req.body;
  const area_id = req.user.area_id;

  try {
    const newZone = await db.query(
      `INSERT INTO dumping_zones (id, area_id, name, latitude, longitude)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4)
       RETURNING *`,
      [area_id, name, lat, lng]
    );
    res.status(201).json(newZone.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};