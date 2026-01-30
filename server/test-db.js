const pool = require('./db');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const res = await pool.query('SELECT NOW()');
    console.log('Connection successful!', res.rows[0]);
    
    console.log('Testing query on products...');
    const products = await pool.query('SELECT COUNT(*) FROM products');
    console.log('Product count:', products.rows[0].count);
    
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
}

testConnection();
