const bcrypt = require('bcryptjs');
const pool = require('./db');
require('dotenv').config();

async function fix() {
  try {
    const hash = await bcrypt.hash('admin123', 10);
    const res = await pool.query("SELECT * FROM users WHERE email='admin@edusaathi.com'");
    
    if (res.rowCount === 0) {
      console.log('Admin not found, inserting new admin...');
      await pool.query("INSERT INTO users (name, email, password, role, status) VALUES ('Admin', 'admin@edusaathi.com', $1, 'admin', 'approved')", [hash]);
    } else {
      console.log('Admin found, updating password and setting status to approved...');
      await pool.query("UPDATE users SET password=$1, status='approved', role='admin' WHERE email='admin@edusaathi.com'", [hash]);
    }
    console.log('Admin credentials successfully fixed! Email: admin@edusaathi.com, Password: admin123');
  } catch (err) {
    console.error('Error fixing admin:', err);
  } finally {
    pool.end();
  }
}

fix();
