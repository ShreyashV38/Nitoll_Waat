const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes'); // Import routes

const app = express();

// ===============================================
// 1. MIDDLEWARE (MUST BE AT THE TOP)
// ===============================================
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// CRITICAL LINE: This allows the server to read "req.body"
app.use(express.json()); 


// ===============================================
// 2. ROUTES (MUST BE AFTER MIDDLEWARE)
// ===============================================
app.get('/', (req, res) => {
  res.json({ message: 'Nitoll Waat Backend is Running 🚀' });
});

// Auth Routes (Login/Register)
app.use('/api/auth', authRoutes);


// ===============================================
// 3. START SERVER
// ===============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
});