const pool = require('./db');
require('dotenv').config();

async function check() {
  try {
    const res = await pool.query('SELECT email, password, status, role FROM users');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
check();
