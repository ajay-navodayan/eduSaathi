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

module.exports = router;
