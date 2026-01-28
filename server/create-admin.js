const pool = require('./db');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const fullName = process.env.ADMIN_NAME || 'Admin User';

    // Check if admin already exists
    const existingAdmin = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingAdmin.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    await pool.query(
      'INSERT INTO users (email, password, full_name, role) VALUES ($1, $2, $3, $4)',
      [email, hashedPassword, fullName, 'admin']
    );

    console.log('Admin user created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
  } catch (err) {
    console.error('Error creating admin user:', err);
  } finally {
    process.exit(0);
  }
}

createAdmin();