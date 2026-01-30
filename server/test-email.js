const { sendReceiptEmail } = require('./email-service');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const mockOrder = {
  customer_name: 'Test Customer',
  customer_email: 'martinwood904@aol.com', // MUST be your Resend account email for testing
  order_number: 'LXTEST123456',
  items: [
    { 
      name: 'Classic Silk Evening Dress', 
      quantity: 1, 
      price: 1200,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&q=80'
    },
    { 
      name: 'Tailored Linen Blazer', 
      quantity: 2, 
      price: 850,
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&q=80'
    }
  ],
  total: 2900,
  shipping_address: '123 Luxury Lane',
  shipping_city: 'Accra',
  shipping_region: 'Greater Accra',
  customer_phone: '+233 24 123 4567',
  discount_amount: 0,
  created_at: new Date().toISOString(),
  payment_method: 'Paystack'
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
