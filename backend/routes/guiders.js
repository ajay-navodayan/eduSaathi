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
    const result = await pool.query(
      'SELECT g.*, u.id_auth as user_id FROM guiders g LEFT JOIN users u ON u.email = g.email WHERE g.id = $1', 
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Guider not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /guiders (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { 
    name, photo, field, designation, city, category, 
    tenth_marks, tenth_board, twelfth_marks, twelfth_board, 
    achievements, linkedin, whatsapp, email, phone, contact 
  } = req.body;
  
  const tempPassword = 'welcome123';

  try {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // 1. Create User Account
    await pool.query(
      'INSERT INTO users (name, email, password, role, status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING',
      [name, email, hashedPassword, 'guider', 'approved']
    );

    // 2. Create Guider Profile
    const result = await pool.query(
      `INSERT INTO guiders (
        name, photo, field, designation, city, category, 
        tenth_marks, tenth_board, twelfth_marks, twelfth_board, 
        achievements, linkedin, whatsapp, email, phone, contact
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [
        name, photo, field, designation, city, field, // Changed category to field
        tenth_marks, tenth_board, twelfth_marks, twelfth_board, 
        achievements, linkedin, whatsapp, email, phone, contact
      ]
    );
    res.status(201).json({ 
      message: 'Guider and User account created successfully', 
      guider: result.rows[0], 
      tempPassword 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error adding guider' });
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
