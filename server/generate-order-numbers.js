const pool = require('./db');

async function checkAndGenerateOrderNumbers() {
  try {
    console.log('Checking existing orders for order_number...');
    
    // Check orders without order_number
    const result = await pool.query('SELECT id, customer_name, created_at FROM orders WHERE order_number IS NULL');
    
    if (result.rows.length > 0) {
      console.log(`Found ${result.rows.length} orders without order_number. Generating...`);
      
      for (const order of result.rows) {
        // Generate Order Number: LX + YYYYMMDD + 4 Random Chars
        const date = new Date(order.created_at);
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const orderNumber = `LX${dateStr}${randomSuffix}`;
        
        await pool.query('UPDATE orders SET order_number = $1 WHERE id = $2', [orderNumber, order.id]);
        console.log(`Generated order number ${orderNumber} for order ID ${order.id}`);
      }
    } else {
      console.log('All orders already have order_number');
    }
    
    // Show all orders
    const allOrders = await pool.query('SELECT id, order_number, customer_name FROM orders');
    console.log('\nAll orders:');
    allOrders.rows.forEach(order => {
      console.log(`ID: ${order.id}, Order Number: ${order.order_number}, Customer: ${order.customer_name}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAndGenerateOrderNumbers();