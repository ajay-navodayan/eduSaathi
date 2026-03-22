require('dotenv').config();
const pool = require('./db');

async function check() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("SUCCESS: messages table is ready");
  } catch (err) {
    console.error("ERROR:", err.message);
  } finally {
    pool.end();
  }
}
check();
