const db = require('../config/db');
const transporter = require('../config/nodemailer'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. REGISTER
exports.register = async (req, res) => {
  const { name, email, mobile, password, role, district, taluka, area_name } = req.body;

  if (!email || !name || !mobile || !district || !taluka || !area_name) {
    return res.status(400).json({ success: false, message: 'Please fill in all fields (Name, Email, Mobile, Location)' });
  }

  try {
    // A. Check if User exists
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1 OR mobile = $2', [email, mobile]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists with this email or mobile' });
    }

    // B. Check if Area exists
    const areaCheck = await db.query(
      'SELECT id FROM areas WHERE area_name = $1 AND taluka = $2 AND district = $3',
      [area_name, taluka, district]
    );

    let areaId;

    if (areaCheck.rows.length > 0) {
      // --- LOGIC CHANGE HERE ---
      // If the area exists, we BLOCK the new user (One Admin per Zone)
      return res.status(409).json({ 
        success: false, 
        message: `The zone '${area_name}' is already registered by another Admin.` 
      });
      
    } else {
      // Area doesn't exist, create it dynamically
      const newArea = await db.query(
        `INSERT INTO areas (id, area_name, taluka, district)
         VALUES (uuid_generate_v4(), $1, $2, $3)
         RETURNING id`,
        [area_name, taluka, district]
      );
      areaId = newArea.rows[0].id;
    }

    // C. Encrypt Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'password123', salt);

    // D. Insert User
    const newUser = await db.query(
      `INSERT INTO users (id, name, email, mobile, password_hash, role, area_id)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, mobile, role, area_id`,
      [name, email, mobile, passwordHash, role || 'ADMIN', areaId]
    );

    res.status(201).json({ success: true, message: 'Admin Account Registered', user: newUser.rows[0] });

  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ... (Keep existing login and verify functions exactly as they are) ...
// 2. LOGIN (Send OTP)
exports.login = async (req, res) => {
  const { email, password } = req.body; // <--- Now accepts password

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password' });
  }

  try {
    // 1. Check if user exists
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = userCheck.rows[0];

    // 2. Verify Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }

    // 3. If Password Correct -> Generate & Send OTP
    const otp = generateOTP();
    
    // Delete old OTPs for this email to keep it clean
    await db.query('DELETE FROM otps WHERE email = $1', [email]);

    await db.query(`INSERT INTO otps (email, code, expires_at) VALUES ($1, $2, NOW() + interval '5 minutes')`, [email, otp]);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Nitoll Waat Login Code',
      text: `Your login code is: ${otp}`
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('Email Error:', err);
        return res.status(500).json({ message: 'Failed to send OTP email' });
      }
      res.json({ success: true, message: `Password verified. OTP sent to ${email}` });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 3. VERIFY (Check OTP)
exports.verify = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const otpCheck = await db.query(
      `SELECT * FROM otps WHERE email = $1 AND code = $2 AND expires_at > NOW()`,
      [email, otp]
    );

    if (otpCheck.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    const token = jwt.sign(
      { id: user.id, role: user.role, area_id: user.area_id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    await db.query('DELETE FROM otps WHERE email = $1', [email]);

    res.json({
      success: true,
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        mobile: user.mobile, 
        role: user.role, 
        area_id: user.area_id 
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};