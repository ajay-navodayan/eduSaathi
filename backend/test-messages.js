const pool = require('./db');

async function test() {
  try {
    // 1. Check if messages table exists
    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages'"
    );
    console.log('Messages table exists:', tables.rows.length > 0);

    if (tables.rows.length === 0) {
      console.log('Creating messages table...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          sender_id INTEGER NOT NULL REFERENCES users(id),
          receiver_id INTEGER NOT NULL REFERENCES users(id),
          content TEXT NOT NULL,
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('Messages table created!');
    }

    // 2. Check columns
    const cols = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'messages'"
    );
    console.log('Columns:', JSON.stringify(cols.rows, null, 2));

    // 3. Test the conversations query
    const convos = await pool.query(`
      SELECT DISTINCT u.id as peer_id, u.name, u.role
      FROM messages m
      JOIN users u ON u.id = m.receiver_id
      WHERE m.sender_id = $1
      UNION
      SELECT DISTINCT u.id as peer_id, u.name, u.role
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.receiver_id = $1
    `, [76]);
    console.log('Conversations:', JSON.stringify(convos.rows));

  } catch (err) {
    console.error('ERROR:', err.message);
  }
  process.exit(0);
}

test();
