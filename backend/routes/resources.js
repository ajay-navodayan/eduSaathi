const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET /resources - with search, category, and class_level filters
router.get('/', async (req, res) => {
  try {
    const { category, q, class_level } = req.query;
    let query = 'SELECT * FROM resources WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      params.push(category);
      query += ` AND category ILIKE $${params.length}`;
    }

    if (class_level) {
      params.push(class_level);
      query += ` AND class_level = $${params.length}`;
    }

    if (q) {
      params.push(`%${q}%`);
      query += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length})`;
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
  const { title, category, drive_link, description, class_level, medium } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO resources (title, category, drive_link, description, class_level, medium) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, category, drive_link, description, class_level, medium]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /resources/bulk (admin only)
router.post('/bulk', authMiddleware, adminMiddleware, async (req, res) => {
  const { resources } = req.body; // Array of { title, category, drive_link, description, class_level, medium }
  if (!Array.isArray(resources) || resources.length === 0) {
    return res.status(400).json({ error: 'Invalid resources array' });
  }

  try {
    // Basic bulk insert implementation using multiple queries or a single concatenated query
    // For simplicity and safety, using a loop with a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const r of resources) {
        await client.query(
          'INSERT INTO resources (title, category, drive_link, description, class_level, medium) VALUES ($1, $2, $3, $4, $5, $6)',
          [r.title, r.category, r.drive_link, r.description, r.class_level, r.medium]
        );
      }
      await client.query('COMMIT');
      res.status(201).json({ message: `${resources.length} resources added successfully` });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during bulk insert' });
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
