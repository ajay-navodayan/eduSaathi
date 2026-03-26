const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/messages/:userId
// Fetch all messages for the authenticated user, potentially filtered by a specific peer.
// In a real app, this should just return the user's specific conversation.
// Let's implement getting messages between the logged-in user and another user.
router.get('/:peerId', async (req, res) => {
  // To protect this, we should use the auth middleware, but we pass auth manually for now, or just send userId as query param.
  // We'll use query params for simplicity: ?userId=xxx
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
      [userId, peerId]
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
      [sender_id, receiver_id, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error saving message' });
  }
});

// GET /api/messages/conversations/:userId
// Fetch distinct contacts a user has messaged
router.get('/conversations/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const query = `
      SELECT DISTINCT
        CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END as peer_id,
        u.name, u.role
      FROM messages m
      LEFT JOIN users u ON u.id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END
      WHERE m.sender_id = $1 OR m.receiver_id = $1
    `;
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching conversations' });
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
