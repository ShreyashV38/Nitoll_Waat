const db = require('../config/db');
const { isPointInBoundary } = require('../services/boundaryValidator');
const { sendError } = require('../middleware/errorHelper');

// GET all zones for the area
exports.getZones = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM dumping_zones WHERE area_id = $1', [req.user.area_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    sendError(res, err, 'Get Zones');
  }
};

// CREATE a new zone (with boundary validation)
exports.createZone = async (req, res) => {
  const { name, lat, lng } = req.body;
  const area_id = req.user.area_id;

  try {
    // Validate coordinates are within admin's area boundary
    const areaRes = await db.query('SELECT taluka FROM areas WHERE id = $1', [area_id]);
    if (areaRes.rows.length > 0) {
      const taluka = areaRes.rows[0].taluka;
      if (!isPointInBoundary(lat, lng, taluka)) {
        return res.status(400).json({
          error: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)}) is outside ${taluka} boundary. Cannot create zone outside your assigned area.`
        });
      }
    }

    const newZone = await db.query(
      `INSERT INTO dumping_zones (id, area_id, name, latitude, longitude)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4)
       RETURNING *`,
      [area_id, name, lat, lng]
    );
    res.status(201).json(newZone.rows[0]);
  } catch (err) {
    console.error(err);
    sendError(res, err, 'Create Zone');
  }
};