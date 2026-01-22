const pool = require('./db');

async function migrate() {
  try {
    console.log('Starting migration: Adding shipping address columns to orders table...');
    
    await pool.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS shipping_address TEXT,
      ADD COLUMN IF NOT EXISTS shipping_city TEXT,
      ADD COLUMN IF NOT EXISTS shipping_region TEXT;
    `);
    
    console.log('Migration successful: Shipping columns added.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
