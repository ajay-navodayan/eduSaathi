const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role || 'student';
    const status = assignedRole === 'student' ? 'approved' : 'pending';
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, status',
      [name, email, hashedPassword, assignedRole, status]
    );
    res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];
    if (user.status === 'pending') {
      return res.status(403).json({ error: 'Your account is pending Admin approval.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    let guiderId = null;
    if (user.role === 'guider') {
      const gRes = await pool.query('SELECT id FROM guiders WHERE email = $1', [user.email]);
      if (gRes.rows.length > 0) guiderId = gRes.rows[0].id;
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1d'
    });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, guiderId }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
