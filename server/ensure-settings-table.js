const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function ensureSettingsTable() {
  try {
    const sqlPath = path.join(__dirname, 'create-settings-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Ensuring settings table exists...');
    await pool.query(sql);
    console.log('Settings table checked/created successfully.');
    
    // Double check if a row exists (it should due to ON CONFLICT in SQL, but good to be sure)
    const result = await pool.query('SELECT * FROM settings WHERE id = 1');
    if (result.rows.length === 0) {
      await pool.query('INSERT INTO settings (id) VALUES (1)');
      console.log('Default settings row inserted.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error ensuring settings table:', err);
    process.exit(1);
  }
}

ensureSettingsTable();
