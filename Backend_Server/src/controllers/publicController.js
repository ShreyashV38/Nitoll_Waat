// src/controllers/publicController.js
const db = require('../config/db');

// 1. Get List of Districts
exports.getDistricts = async (req, res) => {
  try {
    const result = await db.query('SELECT DISTINCT district FROM areas ORDER BY district');
    res.json(result.rows.map(row => row.district));
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// 2. Get Talukas for a specific District
exports.getTalukas = async (req, res) => {
  const { district } = req.query;
  try {
    const result = await db.query(
      'SELECT DISTINCT taluka FROM areas WHERE district = $1 ORDER BY taluka',
      [district]
    );
    res.json(result.rows.map(row => row.taluka));
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// 3. Get Areas (Villages/Municipals) for District + Taluka
exports.getAreas = async (req, res) => {
  const { district, taluka } = req.query;
  try {
    const result = await db.query(
      'SELECT id, area_name FROM areas WHERE district = $1 AND taluka = $2 ORDER BY area_name',
      [district, taluka]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// 4. Get Public Data (Bins & Wards) for a selected Area
exports.getAreaPublicData = async (req, res) => {
  const { area_id } = req.params;
  try {
    const [binsRes, wardsRes] = await Promise.all([
      // ADDED: latitude, longitude to this query
      db.query(
        `SELECT b.id, b.latitude, b.longitude, b.current_fill_percent, b.status, b.last_updated,
                w.name as ward_name
         FROM bins b
         LEFT JOIN wards w ON b.ward_id = w.id
         WHERE b.area_id = $1`,
        [area_id]
      ),
      db.query(`SELECT id, name FROM wards WHERE area_id = $1`, [area_id])
    ]);

    res.json({
      bins: binsRes.rows,
      wards: wardsRes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};