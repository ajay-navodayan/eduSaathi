const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/messages/conversations/:userId
// IMPORTANT: Must be declared BEFORE GET /:peerId to prevent Express routing conflicts
router.get('/conversations/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    // Use UNION instead of CASE WHEN to avoid pg driver syntax issues
    const query = `
      SELECT DISTINCT u.id as peer_id, u.name, u.role
      FROM messages m
      JOIN users u ON u.id = m.receiver_id
      WHERE m.sender_id = $1
      UNION
      SELECT DISTINCT u.id as peer_id, u.name, u.role
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.receiver_id = $1
    `;
    const result = await pool.query(query, [Number(userId)]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching conversations' });
  }
});

// GET /api/messages/:peerId?userId=xxx
// Fetch all messages between logged-in user and a specific peer
router.get('/:peerId', async (req, res) => {
  const { peerId } = req.params;
  const { userId } = req.query;

  if (!userId || !peerId) {
    return res.status(400).json({ error: 'Missing userId or peerId' });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE (sender_id = $1 AND receiver_id = $2) 
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`,
      [Number(userId), Number(peerId)]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/messages
// Save a message to DB
router.post('/', async (req, res) => {
  const { sender_id, receiver_id, content } = req.body;
  if (!sender_id || !receiver_id || !content) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
      [Number(sender_id), Number(receiver_id), content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error saving message' });
  }
});

// PUT /api/messages/mark-read
// Mark all messages from a specific sender as read by the recipient
router.put('/mark-read', async (req, res) => {
  const { sender_id, receiver_id } = req.body;
  if (!sender_id || !receiver_id) {
    return res.status(400).json({ error: 'Missing sender_id or receiver_id' });
  }

  try {
    await pool.query(
      'UPDATE messages SET is_read = true WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false',
      [sender_id, receiver_id]
    );
    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error marking messages as read' });
  }
});

module.exports = router;
