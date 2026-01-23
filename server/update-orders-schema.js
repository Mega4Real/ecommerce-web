const pool = require('./db');

async function updateOrdersSchema() {
  try {
    console.log('Adding missing columns to orders table...');
    
    // Add missing columns
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(255)');
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id INTEGER');
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT');
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(255)');
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_region VARCHAR(255)');
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(255) UNIQUE');
    
    console.log('Schema update completed successfully!');
    
    // Check existing orders
    const result = await pool.query('SELECT COUNT(*) FROM orders');
    console.log(`Total orders in database: ${result.rows[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  }
}

updateOrdersSchema();