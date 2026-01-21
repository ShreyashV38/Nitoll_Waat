const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// --- REGISTER (Create New User) ---
exports.register = async (req, res) => {
  const { name, email, mobile, password, role, area_id, supervisor_id } = req.body;

  try {
    // 1. Check if user already exists
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1 OR mobile = $2', [email, mobile]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email or mobile already exists.' });
    }

    // 2. Hash the password (Encryption)
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 3. Insert into Database
    // Note: We use the columns from your V3 Schema
    const insertQuery = `
      INSERT INTO users (id, name, email, mobile, password_hash, role, area_id, supervisor_id)
      VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email, role;
    `;
    
    const newUser = await db.query(insertQuery, [
      name, email, mobile, password_hash, role, area_id, supervisor_id || null
    ]);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: newUser.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error during registration' });
  }
};

// --- LOGIN (Authenticate User) ---
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid Credentials' });
    }

    const user = result.rows[0];

    // 2. Compare Passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid Credentials' });
    }

    // 3. Generate JWT Token (The "Passport" for the app)
    // The app will send this token with every future request
    const token = jwt.sign(
      { id: user.id, role: user.role, area_id: user.area_id },
      process.env.JWT_SECRET || 'secret_fallback_key', // Ensure JWT_SECRET is in your .env
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        area_id: user.area_id
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error during login' });
  }
};