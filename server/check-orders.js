const pool = require('./db');

async function checkOrders() {
  try {
    const orders = await pool.query('SELECT * FROM orders');
    const users = await pool.query('SELECT id, email, full_name, role FROM users');
    
    console.log('--- USERS ---');
    console.table(users.rows);
    
    console.log('\n--- ORDERS ---');
    orders.rows.forEach((order, index) => {
      console.log(`Order ${index + 1}:`, {
        id: order.id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        items: order.items,
        total: order.total,
        status: order.status,
        user_id: order.user_id,
        created_at: order.created_at
      });
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkOrders();
