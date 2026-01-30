const { sendReceiptEmail } = require('./email-service');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const mockOrder = {
  customer_name: 'Test Customer',
  customer_email: 'martinwood904@aol.com', // MUST be your Resend account email for testing
  order_number: 'LXTEST123456',
  items: [
    { name: 'Classic Silk Evening Dress', quantity: 1, price: 1200 },
    { name: 'Tailored Linen Blazer', quantity: 2, price: 850 }
  ],
  total: 2900,
  shipping_address: '123 Luxury Lane',
  shipping_city: 'Lagos',
  shipping_region: 'Lagos State',
  discount_amount: 0,
  created_at: new Date().toISOString()
};

async function testEmail() {
  console.log('--- Email Delivery Test ---');
  if (!process.env.RESEND_API_KEY) {
    console.error('ERROR: RESEND_API_KEY is missing in server/.env');
    process.exit(1);
  }

  try {
    console.log(`Attempting to send test email to: ${mockOrder.customer_email}`);
    const result = await sendReceiptEmail(mockOrder);
    console.log('Success!', result);
  } catch (err) {
    console.error('Failed to send email:', err);
  }
}

testEmail();
