const pool = require('./db');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Adding sales_count column to products table...');
    await client.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;
    `);

    console.log('Calculating sales counts from existing orders...');
    const ordersResult = await client.query('SELECT items FROM orders');
    const salesData = {};

    ordersResult.rows.forEach(row => {
      const items = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
      items.forEach(item => {
        if (item.productId) {
          salesData[item.productId] = (salesData[item.productId] || 0) + (item.quantity || 1);
        }
      });
    });

    console.log('Updating product sales counts...');
    for (const [productId, count] of Object.entries(salesData)) {
      await client.query(
        'UPDATE products SET sales_count = $1 WHERE id = $2',
        [count, productId]
      );
    }

    await client.query('COMMIT');
    console.log('Migration completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
    process.exit();
  }
}

migrate();
