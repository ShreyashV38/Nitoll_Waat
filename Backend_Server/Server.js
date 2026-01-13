const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const os = require('os');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'nitoll_waat_db', 
    password: '##sv_2338##',
    port: 5432,
});

// Helper: Get Local IP
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// ============================================
// 1. ESP8266 DATA RECEIVER (NEW)
// ============================================
app.post('/bins/update-reading', async (req, res) => {
    try {
        const { bin_id, fill_percent } = req.body;

        if (!bin_id || fill_percent === undefined) {
            return res.status(400).json({ success: false, message: "Missing bin_id or fill_percent" });
        }

        // Determine Status based on fill level
        let status = 'NORMAL';
        if (fill_percent >= 90) status = 'CRITICAL';
        else if (fill_percent >= 70) status = 'WARNING';

        // Insert into bin_readings (History)
        const insertQuery = `
            INSERT INTO bin_readings (id, bin_id, fill_percent, status, recorded_at)
            VALUES (gen_random_uuid(), $1, $2, $3, NOW())
        `;
        await pool.query(insertQuery, [bin_id, fill_percent, status]);

        console.log(`[DATA RECEIVED] Bin: ${bin_id} | Fill: ${fill_percent}% | Status: ${status}`);
        res.json({ success: true, message: "Reading updated" });

    } catch (err) {
        console.error("Error updating bin:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================
// 2. APP DATA ENDPOINT (MODIFIED)
// ============================================
app.get('/bins', async (req, res) => {
    try {
        const { area_id } = req.query;

        // Uses a LATERAL JOIN to get the *latest* reading from bin_readings for each bin
        const query = `
            SELECT 
                b.id, 
                b.latitude, 
                b.longitude, 
                COALESCE(r.fill_percent, 0) as fill_percent,
                COALESCE(r.status, 'NORMAL') as status
            FROM bins b
            LEFT JOIN LATERAL (
                SELECT fill_percent, status
                FROM bin_readings
                WHERE bin_id = b.id
                ORDER BY recorded_at DESC
                LIMIT 1
            ) r ON TRUE
            WHERE b.area_id = $1 AND b.is_active = TRUE
        `;

        // If no area_id is passed, you might want to default to one for testing
        // For now, we keep the requirement or handle null
        const params = area_id ? [area_id] : ['1c6d50ae-b120-4e4c-8a7e-5524eb5ed7fa']; // Defaulting to the ID in your DB dump for testing

        const result = await pool.query(query, params);
        res.json(result.rows);

    } catch (err) {
        console.error("Error fetching bins:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📍 IP for App/ESP: http://${getLocalIP()}:${port}`);
});