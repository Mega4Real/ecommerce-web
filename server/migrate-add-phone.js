const pool = require('./db');

async function migrate() {
  try {
    console.log('Starting migration: Adding phone number field to orders table...');

    await pool.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS customer_phone TEXT;
    `);

    console.log('Migration successful: Phone number field added.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();