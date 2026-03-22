const pool = require('./backend/db');
require('dotenv').config({ path: './backend/.env' });

async function check() {
  try {
    const res = await pool.query('SELECT * FROM users');
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
check();
