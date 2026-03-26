const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET /tutors
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tutors ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /tutors/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT t.*, u.id as user_id FROM tutors t LEFT JOIN users u ON u.email = t.email WHERE t.id = $1', 
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tutor not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /tutors (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, subject, location, contact, experience } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tutors (name, subject, location, contact, experience) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, subject, location, contact, experience]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /tutors/:id (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM tutors WHERE id = $1', [req.params.id]);
    res.json({ message: 'Tutor deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
