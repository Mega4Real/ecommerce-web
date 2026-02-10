const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');

// Load .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
console.log('Testing Paystack Key:', SECRET_KEY ? `${SECRET_KEY.substring(0, 10)}...` : 'MISSING');

async function testPaystack() {
    try {
        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email: 'test@example.com',
                amount: 1000,
                reference: 'TEST_' + Date.now()
            },
            {
                headers: {
                    Authorization: `Bearer ${SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('SUCCESS:', response.data);
    } catch (error) {
        console.error('FAILURE:', error.response ? error.response.data : error.message);
    }
}

testPaystack();
