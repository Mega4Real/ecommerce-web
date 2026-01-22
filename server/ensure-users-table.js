const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function createTable() {
    try {
        const sql = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'customer',
            full_name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`;
        await pool.query(sql);
        console.log('Users table created or already exists');
        process.exit(0);
    } catch (err) {
        console.error('Error creating users table:', err);
        process.exit(1);
    }
}

createTable();
