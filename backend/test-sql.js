const pool = require('./db');

async function debug() {
  try {
    const query = `
      SELECT DISTINCT
        CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END as peer_id,
        u.name, u.role, u.id_auth
      FROM messages m
      LEFT JOIN users u ON u.id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END
      WHERE m.sender_id = $1 OR m.receiver_id = $1
    `;
    const res = await pool.query(query, [1]);
    console.log('SUCCESS:', res.rows);
  } catch (err) {
    console.error('SQL ERROR:', err.message);
  } finally {
    process.exit(0);
  }
}

debug();
