const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET /guiders - with optional category filter
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM guiders';
    const params = [];

    if (category && search) {
      query += ' WHERE category ILIKE $1 AND (name ILIKE $2 OR field ILIKE $2 OR city ILIKE $2)';
      params.push(category, `%${search}%`);
    } else if (category) {
      query += ' WHERE category ILIKE $1';
      params.push(category);
    } else if (search) {
      query += ' WHERE name ILIKE $1 OR field ILIKE $1 OR city ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /guiders/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM guiders WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Guider not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /guiders (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, photo, field, designation, city, category, tenth_marks, twelfth_marks, achievements, whatsapp, email, phone, contact } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO guiders (name, photo, field, designation, city, category, tenth_marks, twelfth_marks, achievements, whatsapp, email, phone, contact) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *',
      [name, photo, field, designation, city, category, tenth_marks, twelfth_marks, achievements, whatsapp, email, phone, contact]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /guiders/:id (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM guiders WHERE id = $1', [req.params.id]);
    res.json({ message: 'Guider deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
