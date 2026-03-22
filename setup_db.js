const pool = require('./backend/db');

async function setupDB() {
  try {
    console.log('Creating messages table if not exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Messages table created successfully.');
  } catch (err) {
    console.error('Error creating messages table:', err);
  } finally {
    pool.end();
  }
}

setupDB();
