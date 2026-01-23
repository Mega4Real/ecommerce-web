const pool = require('./db');

async function checkOrder() {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE order_number = $1', ['LX20260123OLID']);
    console.log('Order data:', JSON.stringify(result.rows[0], null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

checkOrder();
