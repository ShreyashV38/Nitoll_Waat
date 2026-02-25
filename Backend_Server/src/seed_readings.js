// src/seed_readings.js
// One-time script to backfill bin_readings for the past 7 days
// Run: node src/seed_readings.js

const db = require('./config/db');

async function seedReadings() {
    try {
        // Get all bins
        const binsRes = await db.query('SELECT id, area_id FROM bins');
        const bins = binsRes.rows;

        if (bins.length === 0) {
            console.log('❌ No bins found. Create some bins first.');
            process.exit(1);
        }

        console.log(`📦 Found ${bins.length} bins. Generating 7-day reading history...`);

        const insertValues = [];
        const now = new Date();

        // For each of the past 7 days
        for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
            const date = new Date(now);
            date.setDate(date.getDate() - dayOffset);

            // 3-5 readings per bin per day (simulates collection cycles)
            const readingsPerDay = 3 + Math.floor(Math.random() * 3);

            for (const bin of bins) {
                for (let r = 0; r < readingsPerDay; r++) {
                    // Randomize the hour of the reading
                    const hour = 6 + Math.floor(Math.random() * 14); // 6 AM to 8 PM
                    const minute = Math.floor(Math.random() * 60);
                    const readingTime = new Date(date);
                    readingTime.setHours(hour, minute, 0, 0);

                    // Simulate realistic weight readings (0.5 to 25 kg per reading)
                    const weight = (Math.random() * 24.5 + 0.5).toFixed(2);
                    const fillPercent = Math.floor(Math.random() * 90 + 5); // 5% to 95%
                    const status = fillPercent > 80 ? 'CRITICAL' : fillPercent > 50 ? 'FULL' : 'NORMAL';

                    insertValues.push(
                        `('${bin.id}', ${fillPercent}, ${weight}, '${status}', '${readingTime.toISOString()}')`
                    );
                }
            }
        }

        // Batch insert
        const insertQuery = `
            INSERT INTO bin_readings (bin_id, fill_percent, weight, status, recorded_at)
            VALUES ${insertValues.join(',\n')}
        `;

        await db.query(insertQuery);

        console.log(`✅ Inserted ${insertValues.length} readings across 7 days for ${bins.length} bins!`);
        console.log('📊 The Waste Collection Trends chart will now display data on your Dashboard.');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding Error:', err.message);
        process.exit(1);
    }
}

seedReadings();
