const db = require('./config/db');
const bcrypt = require('bcryptjs');

const seedDrivers = async () => {
  console.log("🌱 Starting Driver Seeding...");

  try {
    // 1. GET OR CREATE AREA (e.g., "Panjim")
    // NOTE: If this fails with 'column "name" does not exist', check your 'areas' table schema
    let areaRes = await db.query(`SELECT id FROM areas WHERE name = 'Panjim'`);
    let area_id;
    
    if (areaRes.rows.length === 0) {
      const newArea = await db.query(
        `INSERT INTO areas (id, name, city, state, country) 
         VALUES (uuid_generate_v4(), 'Panjim', 'Panjim', 'Goa', 'India') 
         RETURNING id`
      );
      area_id = newArea.rows[0].id;
      console.log("✅ Created Area: Panjim");
    } else {
      area_id = areaRes.rows[0].id;
      console.log("ℹ️ Found Area: Panjim");
    }

    // 2. GET OR CREATE WARD (e.g., "Market Ward")
    let wardRes = await db.query(`SELECT id FROM wards WHERE name = 'Market Ward' AND area_id = $1`, [area_id]);
    let ward_id;

    if (wardRes.rows.length === 0) {
      const newWard = await db.query(
        `INSERT INTO wards (id, area_id, name) VALUES (uuid_generate_v4(), $1, 'Market Ward') RETURNING id`,
        [area_id]
      );
      ward_id = newWard.rows[0].id;
      console.log("✅ Created Ward: Market Ward");
    } else {
      ward_id = wardRes.rows[0].id;
      console.log("ℹ️ Found Ward: Market Ward");
    }

    // 3. CREATE DRIVER (The User)
    const driverEmail = "driver@demo.com";
    let driverRes = await db.query(`SELECT id FROM users WHERE email = $1`, [driverEmail]);
    let driver_id;

    if (driverRes.rows.length === 0) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      
      // ✅ FIXED: Changed 'password' to 'password_hash'
      // ✅ FIXED: Removed 'is_verified' as it's not in your schema
      const newDriver = await db.query(
        `INSERT INTO users (
            id, name, email, password_hash, role, mobile, area_id, assigned_ward_id
         ) VALUES (
            uuid_generate_v4(), 'Rajesh Kumar', $1, $2, 'DRIVER', '9876543210', $3, $4
         ) RETURNING id`,
        [driverEmail, hashedPassword, area_id, ward_id]
      );
      driver_id = newDriver.rows[0].id;
      console.log("✅ Created Driver: Rajesh Kumar (driver@demo.com)");
    } else {
      driver_id = driverRes.rows[0].id;
      console.log("ℹ️ Found Driver: Rajesh Kumar");
    }

    // 4. ASSIGN VEHICLE
    let vehicleRes = await db.query(`SELECT id FROM vehicles WHERE driver_id = $1`, [driver_id]);
    
    if (vehicleRes.rows.length === 0) {
      // ✅ FIXED: Changed 'registration_number' to 'license_plate'
      // ✅ FIXED: Removed 'capacity'
      // ✅ FIXED: Used correct Enum values 'OPEN_TRUCK' and 'ACTIVE'
      await db.query(
        `INSERT INTO vehicles (
            id, area_id, driver_id, license_plate, type, status
         ) VALUES (
            uuid_generate_v4(), $1, $2, 'GA-01-A-1234', 'OPEN_TRUCK', 'ACTIVE'
         )`,
        [area_id, driver_id]
      );
      console.log("✅ Created Vehicle: GA-01-A-1234 linked to Driver");
    } else {
      console.log("ℹ️ Driver already has a vehicle");
    }

    console.log("\n🎉 SEEDING COMPLETE! Login with: driver@demo.com / password123");
    process.exit(0);

  } catch (err) {
    console.error("❌ Seeding Failed:", err.message);
    process.exit(1);
  }
};

seedDrivers();