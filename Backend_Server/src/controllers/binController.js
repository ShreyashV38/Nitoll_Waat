const db = require('../config/db');
const io = require('../config/socket');
const { getIO } = require('../config/socket');
// 1. GET ALL BINS
exports.getAllBins = async (req, res) => {
  try {
    const area_id = req.user.area_id; // Extracted from protect middleware
    const result = await db.query(
      'SELECT * FROM bins WHERE area_id = $1 ORDER BY last_updated DESC', 
      [area_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

// 2. CREATE BIN
exports.createBin = async (req, res) => {
  const { id, level, lat, lng, ward_id } = req.body; 
  const area_id = req.user.area_id;

  try {
    const binIdToInsert = (id && id.trim() !== "") ? id : null;

    const newBin = await db.query(
      `INSERT INTO bins (id, area_id, latitude, longitude, current_fill_percent, status, ward_id, last_updated)
       VALUES (COALESCE($1, uuid_generate_v4()), $2, $3, $4, $5, 'NORMAL', $6, NOW())
       RETURNING *`,
      [binIdToInsert, area_id, lat, lng, level || 0, ward_id]
    );

    res.status(201).json({ success: true, bin: newBin.rows[0] });
  } catch (err) {
    console.error("Create Bin Error:", err);
    if (err.code === '22P02') {
      return res.status(400).json({ error: 'Invalid Bin ID Format.' });
    }
    res.status(500).json({ error: 'Server Error' });
  }
};

// 3. IOT UPDATE (Handles Weight & Lid)
// This endpoint receives data from the ESP8266
exports.updateBinReading = async (req, res) => {
  const { bin_id, fill_percent, lid_status, lid_angle, weight } = req.body;

  if (!bin_id || fill_percent === undefined) {
    return res.status(400).json({ success: false, message: 'Missing Data' });
  }

  // --- FIX: REMOVE WHITESPACE ---
  const cleanBinId = bin_id.trim(); 

  try {
    // A. Calculate Status
    let status = 'NORMAL';
    if (fill_percent >= 90) status = 'CRITICAL';
    else if (fill_percent >= 70) status = 'WARNING';

    // B. Update Database (Use cleanBinId)
    await db.query(
      `UPDATE bins 
       SET current_fill_percent = $1, 
           status = $2, 
           lid_status = $3, 
           lid_angle = $4,
           current_weight = $5, 
           last_updated = NOW() 
       WHERE id = $6`,
      [
        fill_percent, 
        status, 
        lid_status || 'CLOSED', 
        lid_angle || 0,         
        weight || 0.00,         
        cleanBinId // <--- USING TRIMMED ID
      ]
    );

    // C. Save History
    await db.query(
      `INSERT INTO bin_readings (bin_id, fill_percent, status, weight, lid_status, lid_angle, recorded_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        cleanBinId, 
        fill_percent, 
        status, 
        weight || 0.00,
        lid_status || 'CLOSED',  // <--- Added
        lid_angle || 0           // <--- Added
      ]
    );

    // D. Send Socket Update
    const socket = io.getIO();
    socket.emit('bin_update', { 
        id: cleanBinId, 
        fill_percent, 
        status, 
        lid_status: lid_status || 'CLOSED', 
        weight: weight || 0.0 
    });

    // E. Handle Alerts
    if (status === 'CRITICAL') {
      const alertMsg = `Bin ${cleanBinId.substring(0,8)} is CRITICAL (${fill_percent}%)`;
      await db.query(
        `INSERT INTO alerts (bin_id, message, severity, created_at) VALUES ($1, $2, 'HIGH', NOW())`,
        [cleanBinId, alertMsg]
      );
      socket.emit('new_alert', { message: alertMsg, severity: 'HIGH' });
    }

    res.json({ success: true, status });

  } catch (err) {
    console.error("IoT Update Error:", err);
    res.status(500).json({ error: err.message });
  }
};
// 4. MARK BIN AS COLLECTED
exports.markBinCollected = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Update Database (Reset Fill & Weight)
        await db.query(
            `UPDATE bins SET current_fill_percent = 0, current_weight = 0, status = 'NORMAL', last_updated = NOW() 
             WHERE id = $1`, 
            [id]
        );

        // 2. Log History
        await db.query(
            `INSERT INTO bin_readings (bin_id, fill_percent, weight, status, recorded_at)
             VALUES ($1, 0, 0, 'NORMAL', NOW())`,
            [id]
        );

        // 3. NOTIFY WEBSITE (Socket.IO)
        const io = getIO();
        io.emit('binUpdated', {
            id: id,
            fill_percent: 0,
            status: 'NORMAL'
        });

        res.json({ success: true, message: "Bin collected" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
};