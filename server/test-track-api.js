const pool = require('./db');

async function testTrackAPI() {
  try {
    console.log('Testing track API with order number LX20260123OLID...');
    
    const result = await pool.query('SELECT order_number, customer_name, customer_email, customer_phone, total, status, created_at, items, shipping_address, shipping_city, shipping_region FROM orders WHERE order_number = $1', ['LX20260123OLID']);
    
    console.log('Query result:');
    console.log('Number of rows:', result.rows.length);
    
    if (result.rows.length > 0) {
      const order = result.rows[0];
      console.log('Order data:');
      console.log('- order_number:', order.order_number);
      console.log('- customer_name:', order.customer_name);
      console.log('- items:', order.items);
      console.log('- items type:', typeof order.items);
      console.log('- items is array:', Array.isArray(order.items));
      
      if (order.items) {
        console.log('- items keys:', Object.keys(order.items));
        if (Array.isArray(order.items)) {
          console.log('- items length:', order.items.length);
          order.items.forEach((item, idx) => {
            console.log(`  Item ${idx}:`, item);
          });
        }
      }
    } else {
      console.log('No order found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testTrackAPI();