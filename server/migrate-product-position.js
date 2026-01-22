const pool = require('./db');

async function migrate() {
  try {
    console.log('Starting migration: Adding position column to products table...');
    
    // Add position column
    await pool.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS position INTEGER;
    `);
    
    console.log('Position column added.');
    
    // Initialize position values based on current ID order
    await pool.query(`
      UPDATE products 
      SET position = id 
      WHERE position IS NULL;
    `);
    
    console.log('Position values initialized.');
    console.log('Migration successful!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
