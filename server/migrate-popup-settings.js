const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting migration: Adding popup settings...');
    
    await client.query(`
      ALTER TABLE settings 
      ADD COLUMN IF NOT EXISTS popup_enabled BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS popup_title VARCHAR(255) DEFAULT 'Special Offer!',
      ADD COLUMN IF NOT EXISTS popup_subtitle VARCHAR(255) DEFAULT 'Subscribe to our newsletter and get 20% off your first order.',
      ADD COLUMN IF NOT EXISTS popup_message TEXT,
      ADD COLUMN IF NOT EXISTS popup_coupon_code VARCHAR(50) DEFAULT 'WELCOME20',
      ADD COLUMN IF NOT EXISTS popup_button_text VARCHAR(100) DEFAULT 'Shop Now',
      ADD COLUMN IF NOT EXISTS popup_button_link VARCHAR(255) DEFAULT '/shop',
      ADD COLUMN IF NOT EXISTS popup_delay INTEGER DEFAULT 3,
      ADD COLUMN IF NOT EXISTS popup_show_once BOOLEAN DEFAULT true;
    `);
    
    console.log('Migration completed successfully: Popup settings added.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
