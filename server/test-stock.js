const pool = require('./db');
const crypto = require('crypto');

async function testStockReduction() {
  const client = await pool.connect();
  try {
    // 1. Create a test product
    console.log('Creating test product...');
    const productResult = await client.query(
      "INSERT INTO products (name, price, stock_quantity, images, sizes, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      ['Test Stock Product', 100.00, 2, ['http://example.com/image.jpg'], ['M'], 'Tops']
    );
    const productId = productResult.rows[0].id;
    console.log(`Test product created with ID: ${productId}, Quantity: 2`);

    // 2. Simulate an order
    console.log('Simulating order...');
    const orderNumber = `TEST${Date.now()}`;
    const items = [{ productId, quantity: 1 }];
    const itemsJson = JSON.stringify(items);

    await client.query('BEGIN');
    await client.query(
      'INSERT INTO orders (customer_name, customer_email, items, total, status, order_number) VALUES ($1, $2, $3, $4, $5, $6)',
      ['Test User', 'test@example.com', itemsJson, 100.00, 'pending', orderNumber]
    );

    // Update stock
    for (const item of items) {
      const updateResult = await client.query(
        'UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - $1) WHERE id = $2 RETURNING stock_quantity, sold',
        [item.quantity, item.productId]
      );
      console.log(`Updated product ${item.productId}: Quantity = ${updateResult.rows[0].stock_quantity}, Sold = ${updateResult.rows[0].sold}`);
    }
    await client.query('COMMIT');

    // 3. Simulate another order to reach 0
    console.log('Simulating second order to reach 0...');
    await client.query('BEGIN');
    for (const item of items) {
      const updateResult = await client.query(
        'UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - $1) WHERE id = $2 RETURNING stock_quantity',
        [item.quantity, item.productId]
      );
      if (updateResult.rows[0].stock_quantity === 0) {
        await client.query('UPDATE products SET sold = true WHERE id = $1', [item.productId]);
      }
    }
    await client.query('COMMIT');

    // 4. Verify result
    const finalResult = await client.query('SELECT stock_quantity, sold FROM products WHERE id = $1', [productId]);
    console.log('Final Product State:', finalResult.rows[0]);

    if (finalResult.rows[0].stock_quantity === 0 && finalResult.rows[0].sold === true) {
      console.log('VERIFICATION SUCCESSFUL: Stock reached 0 and product marked as sold.');
    } else {
      console.log('VERIFICATION FAILED.');
    }

    // Cleanup
    await client.query('DELETE FROM orders WHERE order_number = $1', [orderNumber]);
    await client.query('DELETE FROM products WHERE id = $1', [productId]);

  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

testStockReduction();
