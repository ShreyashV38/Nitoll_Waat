const db = require('../config/db');
const { sendError } = require('../middleware/errorHelper');

// Get all wards for the logged-in Admin's Area
exports.getWards = async (req, res) => {
  try {
    const area_id = req.user.area_id;
    const result = await db.query('SELECT * FROM wards WHERE area_id = $1 ORDER BY name', [area_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    sendError(res, err, 'Get Wards');
  }
};

// Create a new Ward (e.g., "Market Area")
exports.createWard = async (req, res) => {
  const { name, description } = req.body;
  const area_id = req.user.area_id;

  if (!name) return res.status(400).json({ message: 'Name required' });

  try {
    // 1. Check if name already exists in this area to prevent duplicates
    const check = await db.query('SELECT * FROM wards WHERE area_id = $1 AND name = $2', [area_id, name]);
    if (check.rows.length > 0) {
      return res.status(400).json({ message: 'Ward name already exists' });
    }

    // 2. Insert only valid columns (id, area_id, name, description, created_at)
    const query = `
      INSERT INTO wards (id, area_id, name, description, created_at) 
      VALUES (uuid_generate_v4(), $1, $2, $3, NOW()) 
      RETURNING *
    `;

    const newWard = await db.query(query, [
      area_id,
      name,
      description || ''
    ]);

    res.status(201).json(newWard.rows[0]);
  } catch (err) {
    console.error("Create Ward Error:", err);
    sendError(res, err, 'Create Ward');
  }
};

exports.getWardStats = async (req, res) => {
  try {
    const area_id = req.user.area_id; // Extracted from token

    // VERIFIED QUERY:
    // 1. Selects Ward Name and ID
    // 2. Joins 'bins' table using 'ward_id'
    // 3. Counts Total Bins per ward
    // 4. Counts 'Pending' bins where fill level >= 70%
    const query = `
      SELECT 
        w.id, 
        w.name as ward_name, 
        COUNT(b.id)::int as total_bins,
        COUNT(CASE WHEN b.current_fill_percent >= 70 THEN 1 END)::int as pending_bins
      FROM wards w
      LEFT JOIN bins b ON w.id = b.ward_id
      WHERE w.area_id = $1
      GROUP BY w.id, w.name
      ORDER BY w.name ASC;
    `;

    const result = await db.query(query, [area_id]);

    // Map to match Android 'Ward' model
    const formattedData = result.rows.map(row => ({
      wardName: row.ward_name,
      totalBins: row.total_bins,
      pendingBins: row.pending_bins,
      isCollected: row.pending_bins === 0 // Green checkmark if 0 pending
    }));

    res.json(formattedData);
  } catch (err) {
    console.error("Get Ward Stats Error:", err);
    sendError(res, err, 'Ward Stats');
  }
};