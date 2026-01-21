const { Pool } = require('pg');
require('dotenv').config();

// Create a single connection pool for the entire app
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test the connection immediately
pool.on('connect', () => {
  console.log('✅ Database Connected Successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected Database Error:', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};