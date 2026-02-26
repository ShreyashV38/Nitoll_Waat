// src/controllers/complaintController.js
const db = require('../config/db');
const { sendError } = require('../middleware/errorHelper');

// 1. Create complaint (Public - no auth required)
exports.createComplaint = async (req, res) => {
    try {
        const { bin_id, type, description, reporter_name, reporter_contact } = req.body;

        // --- ADDED: Validation Check ---
        if (!bin_id || !type) {
            console.warn(`[COMPLAINT_ERR] Missing required fields: bin_id=${bin_id}, type=${type}`);
            return res.status(400).json({ error: 'bin_id and type are required' });
        }

        // Get area_id from the bin
        const binRes = await db.query('SELECT area_id FROM bins WHERE id = $1', [bin_id]);
        if (binRes.rows.length === 0) {
            console.warn(`[COMPLAINT_ERR] Bin not found for ID: ${bin_id}`);
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

        // --- ADDED: Delivery / Routing Log ---
        console.log(`[COMPLAINT_SUCCESS] Routed complaint ${result.rows[0].id} to Admin of area ${area_id}`);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(`[COMPLAINT_API_ERR] Server error during createComplaint:`, err);
        sendError(res, err, 'Create Complaint');
    }
};

// 2. Get complaints for admin's area
exports.getComplaints = async (req, res) => {
    try {
        const area_id = req.user.area_id;

        // --- ADDED: Delivery Verification Log ---
        console.log(`[COMPLAINT_FETCH] Admin for area ${area_id} requested complaints`);

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
        console.error(`[COMPLAINT_FETCH_ERR] Server error during getComplaints:`, err);
        sendError(res, err, 'Get Complaints');
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
        sendError(res, err, 'Resolve Complaint');
    }
};
