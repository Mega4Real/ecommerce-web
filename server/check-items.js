const pool = require('./db');

async function checkOrderItems() {
  try {
    console.log('Checking items data in orders...');
    
    const result = await pool.query('SELECT order_number, items FROM orders');
    
    result.rows.forEach(order => {
      console.log(`\nOrder: ${order.order_number}`);
      console.log(`Items: ${order.items}`);
      console.log(`Type: ${typeof order.items}`);
      if (order.items) {
        console.log(`Is Array: ${Array.isArray(order.items)}`);
        try {
          const parsed = JSON.parse(order.items);
          console.log(`Parsed length: ${parsed.length}`);
        } catch (e) {
          console.log('Parse error:', e.message);
        }
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkOrderItems();