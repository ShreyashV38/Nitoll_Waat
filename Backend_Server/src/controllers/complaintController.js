// src/controllers/complaintController.js
const db = require('../config/db');

// 1. Create complaint (Public - no auth required)
exports.createComplaint = async (req, res) => {
    try {
        const { bin_id, type, description, reporter_name, reporter_contact } = req.body;

        // Get area_id from the bin
        const binRes = await db.query('SELECT area_id FROM bins WHERE id = $1', [bin_id]);
        if (binRes.rows.length === 0) {
            return res.status(404).json({ error: 'Bin not found' });
        }
        const area_id = binRes.rows[0].area_id;

        const result = await db.query(
            `INSERT INTO complaints (bin_id, area_id, type, description, reporter_name, reporter_contact)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [bin_id, area_id, type, description, reporter_name, reporter_contact]
        );

        // Also create an alert for the admin
        await db.query(
            `INSERT INTO alerts (bin_id, severity, message)
       VALUES ($1, 'MEDIUM', $2)`,
            [bin_id, `Citizen complaint: ${type} - ${description || 'No details'}`]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// 2. Get complaints for admin's area
exports.getComplaints = async (req, res) => {
    try {
        const area_id = req.user.area_id;
        const result = await db.query(
            `SELECT c.*, b.latitude, b.longitude 
       FROM complaints c
       LEFT JOIN bins b ON c.bin_id = b.id
       WHERE c.area_id = $1
       ORDER BY c.created_at DESC`,
            [area_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
};

// 3. Resolve complaint
exports.resolveComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `UPDATE complaints SET status = 'RESOLVED', resolved_at = NOW() WHERE id = $1 RETURNING *`,
            [id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
};
