const db = require('../config/db');
const transporter = require('../config/nodemailer'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.register = async (req, res) => {
  const { name, email, mobile, password, role, district, taluka, area_name } = req.body;

  // 1. Validate ALL fields (Now required for Drivers too)
  if (!email || !name || !password || !district || !taluka || !area_name) {
    return res.status(400).json({ success: false, message: 'Please fill all fields: Name, Email, Pass, and Location.' });
  }

  try {
    // 2. Check User Existence
    const userCheck = await db.query(
        'SELECT * FROM users WHERE email = $1 OR (mobile IS NOT NULL AND mobile = $2)', 
        [email, mobile || '']
    );
    if (userCheck.rows.length > 0) return res.status(400).json({ success: false, message: 'User already exists' });

    // 3. Find Area ID based on Location Input
    const areaCheck = await db.query(
      'SELECT id FROM areas WHERE area_name = $1 AND taluka = $2 AND district = $3',
      [area_name, taluka, district]
    );

    let areaId = null;

    if (areaCheck.rows.length > 0) {
      // --- SCENARIO A: Area Exists ---
      if (role !== 'DRIVER') {
         // If a new Admin tries to claim an existing area -> Block them
         return res.status(409).json({ success: false, message: `The zone '${area_name}' is already taken.` });
      }
      // If Driver -> LINK THEM to this ID
      areaId = areaCheck.rows[0].id;

    } else {
      // --- SCENARIO B: Area Does Not Exist ---
      if (role === 'DRIVER') {
         // Driver cannot create new areas
         return res.status(404).json({ success: false, message: 'This Area is not registered! Please ask your Admin to register first.' });
      }
      // If Admin -> Create New Area
      const newArea = await db.query(
        `INSERT INTO areas (id, area_name, taluka, district) VALUES (uuid_generate_v4(), $1, $2, $3) RETURNING id`,
        [area_name, taluka, district]
      );
      areaId = newArea.rows[0].id;
    }

    // 4. Encrypt Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 5. Insert User (Now with area_id linked)
    const newUser = await db.query(
      `INSERT INTO users (id, name, email, mobile, password_hash, role, area_id)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, area_id`,
      [name, email, mobile || null, passwordHash, role || 'DRIVER', areaId]
    );

    // 6. Generate Token
    const token = jwt.sign(
        { id: newUser.rows[0].id, role: newUser.rows[0].role, area_id: newUser.rows[0].area_id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );

    res.status(201).json({ success: true, message: 'Registration Successful', token, user: newUser.rows[0] });

  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ... (Keep existing login and verify functions) ...
exports.login = async (req, res) => {
    // ... existing login code ...
    const { email, password } = req.body; 
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

    try {
        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length === 0) return res.status(404).json({ message: 'User not found.' });

        const user = userCheck.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Invalid Credentials' });

        const otp = generateOTP();
        await db.query('DELETE FROM otps WHERE email = $1', [email]);
        await db.query(`INSERT INTO otps (email, code, expires_at) VALUES ($1, $2, NOW() + interval '5 minutes')`, [email, otp]);

        const mailOptions = { from: process.env.EMAIL_USER, to: email, subject: 'Login Code', text: `Code: ${otp}` };
        transporter.sendMail(mailOptions, (err) => {
            if (err) return res.status(500).json({ message: 'Email failed' });
            res.json({ success: true, message: `OTP sent` });
        });
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
};

exports.verify = async (req, res) => {
    // ... existing verify code ...
    const { email, otp } = req.body;
    try {
        const otpCheck = await db.query(`SELECT * FROM otps WHERE email = $1 AND code = $2 AND expires_at > NOW()`, [email, otp]);
        if (otpCheck.rows.length === 0) return res.status(400).json({ success: false, message: 'Invalid OTP' });

        const user = (await db.query('SELECT * FROM users WHERE email = $1', [email])).rows[0];
        const token = jwt.sign({ id: user.id, role: user.role, area_id: user.area_id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        
        await db.query('DELETE FROM otps WHERE email = $1', [email]);
        res.json({ success: true, token, user });
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
};