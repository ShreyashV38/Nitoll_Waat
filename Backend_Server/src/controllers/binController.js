const db = require('../config/db');
const io = require('../config/socket');

// GET /api/bins
exports.getAllBins = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM bins ORDER BY last_updated DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

// POST /api/bins/update (IoT Endpoint)
exports.updateBinReading = async (req, res) => {
  const { bin_id, fill_percent } = req.body;

  if (!bin_id || fill_percent === undefined) {
    return res.status(400).json({ success: false, message: 'Missing bin_id or fill_percent' });
  }

  try {
    // 1. Determine Status
    let status = 'NORMAL';
    if (fill_percent >= 90) status = 'CRITICAL';
    else if (fill_percent >= 70) status = 'WARNING';

    // 2. Update Live Bin Table
    await db.query(
      `UPDATE bins SET current_fill_percent = $1, status = $2, last_updated = NOW() WHERE id = $3`,
      [fill_percent, status, bin_id]
    );

    // 3. Insert History Log
    await db.query(
      `INSERT INTO bin_readings (bin_id, fill_percent, status, recorded_at) VALUES ($1, $2, $3, NOW())`,
      [bin_id, fill_percent, status]
    );

    // 4. Real-Time Updates
    const socket = io.getIO();
    
    // Emit general update to map
    socket.emit('bin_update', { id: bin_id, fill_percent, status });

    // 5. Critical Alert Logic
    if (status === 'CRITICAL') {
      const alertMsg = `Bin ${bin_id} is ${fill_percent}% full!`;
      
      // Save Alert to DB
      const alertRes = await db.query(
        `INSERT INTO alerts (bin_id, message, severity) VALUES ($1, $2, 'HIGH') RETURNING *`,
        [bin_id, alertMsg]
      );
      
      // Emit Specific Alert Event
      socket.emit('new_alert', alertRes.rows[0]);
    }

    res.json({ success: true, status });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};