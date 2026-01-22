const pool = require('./db');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting migration: Add order_number to orders table...');
    await client.query('BEGIN');

    // Add order_number column
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS order_number VARCHAR(50) UNIQUE;
    `);

    // Populate existing orders with a generated number (fallback)
    // For existing orders, we'll just use LX-OLD-{id} to ensure uniqueness
    await client.query(`
      UPDATE orders 
      SET order_number = 'LX-OLD-' || id 
      WHERE order_number IS NULL;
    `);

    // Make it not null after population
    await client.query(`
      ALTER TABLE orders 
      ALTER COLUMN order_number SET NOT NULL;
    `);

    await client.query('COMMIT');
    console.log('Migration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();
