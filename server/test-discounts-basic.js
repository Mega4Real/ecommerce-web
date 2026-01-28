const fetch = require('node-fetch'); // If not installed, use http/https module but fetch is easier

async function testValidation() {
  const API_URL = 'http://localhost:3002'; // Adjust to your server port
  
  console.log('--- Testing Discount Validation ---');
  
  // 1. Validate non-existent code
  try {
    const res = await fetch(`${API_URL}/api/discounts/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'FAKECODE', subtotal: 1000, itemsCount: 1 })
    });
    console.log('Non-existent code:', res.status === 400 ? 'OK' : 'FAIL');
  } catch (e) {
    console.log('Server might not be running at', API_URL);
    return;
  }

  // To test more, we would need to create a discount via Admin API (needs JWT)
  // or check the DB directly. Since this is a manual check script for the user:
  console.log('\nSuggested Manual Check:');
  console.log('1. Go to Admin Dashboard -> Settings');
  console.log('2. Create a code: TEST20, Percentage, 20%');
  console.log('3. Go to /cart, apply TEST20');
  console.log('4. Verify discount GH₵200 on GH₵1000 subtotal');
}

testValidation();
