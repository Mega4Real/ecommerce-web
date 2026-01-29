const pool = require('./db');

async function migrate() {
  try {
    console.log('Starting migration: Adding stock_quantity to products table...');
    
    // Check if column exists
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='products' AND column_name='stock_quantity'
    `);

    if (columnCheck.rows.length === 0) {
      await pool.query('ALTER TABLE products ADD COLUMN stock_quantity INTEGER DEFAULT 0');
      console.log('Successfully added stock_quantity column.');
    } else {
      console.log('stock_quantity column already exists.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
