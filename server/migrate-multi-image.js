const pool = require('./db');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('--- Migration Started ---');
    await client.query('BEGIN');

    // 1. List tables to confirm 'products' exists
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Existing tables:', tables.rows.map(r => r.table_name).join(', '));

    if (!tables.rows.some(r => r.table_name === 'products')) {
      console.log('Table "products" does not exist. Initializing schema first...');
      // If table doesn't exist, we can't migrate. The user should run init-db.js after schema update.
      // But let's check columns anyway if it does exist.
      return;
    }

    // 2. Check columns
    const columns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products'
    `);
    const columnNames = columns.rows.map(r => r.column_name);
    console.log('Current columns in "products":', columnNames.join(', '));

    if (columnNames.includes('image') && !columnNames.includes('images')) {
      console.log('Migrating: Renaming "image" to "images" array...');
      
      // Add column
      await client.query('ALTER TABLE products ADD COLUMN images TEXT[]');
      // Move data
      await client.query('UPDATE products SET images = ARRAY[image] WHERE image IS NOT NULL');
      // Drop old
      await client.query('ALTER TABLE products DROP COLUMN image');
      
      console.log('Migration SUCCESSFUL.');
    } else if (columnNames.includes('images')) {
      console.log('Migration SKIPPED: "images" column already exists.');
    } else {
      console.log('Migration FAILED: Could not find "image" column to migrate.');
    }

    await client.query('COMMIT');
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error('Migration ERROR:', err);
  } finally {
    if (client) client.release();
    process.exit();
  }
}

migrate();
