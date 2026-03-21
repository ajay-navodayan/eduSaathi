const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET /resources - with optional category filter
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM resources';
    const params = [];

    if (category) {
      query += ' WHERE category ILIKE $1';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /resources (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { title, category, drive_link, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO resources (title, category, drive_link, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, category, drive_link, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /resources/:id (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM resources WHERE id = $1', [req.params.id]);
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
