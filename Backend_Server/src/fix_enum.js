const db = require('./config/db');

const fixEnum = async () => {
  console.log("🔧 Updating Database Enum...");
  try {
    // This command adds 'BLOCKED' to the list of allowed statuses
    await db.query(`ALTER TYPE bin_status ADD VALUE IF NOT EXISTS 'BLOCKED';`);
    console.log("✅ Success: 'BLOCKED' status added to database!");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    process.exit();
  }
};

fixEnum();