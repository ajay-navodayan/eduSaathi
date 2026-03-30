const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /register
router.post('/register', async (req, res) => {
  const {
    name, email, password, role,
    photo, field, designation, city, category,
    tenth_marks, tenth_board, twelfth_marks, twelfth_board,
    achievements, linkedin, whatsapp, phone, mentor_type
  } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role || 'student';
    const status = assignedRole === 'student' ? 'approved' : 'pending';
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, status',
      [name, email, hashedPassword, assignedRole, status]
    );

    if (assignedRole === 'guider') {
      await pool.query(
        `INSERT INTO guiders (
          name, email, photo, field, designation, city, category,
          tenth_marks, tenth_board, twelfth_marks, twelfth_board,
          achievements, linkedin, whatsapp, phone, mentor_type
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          photo = EXCLUDED.photo,
          field = EXCLUDED.field,
          designation = EXCLUDED.designation,
          city = EXCLUDED.city,
          category = EXCLUDED.category,
          tenth_marks = EXCLUDED.tenth_marks,
          tenth_board = EXCLUDED.tenth_board,
          twelfth_marks = EXCLUDED.twelfth_marks,
          twelfth_board = EXCLUDED.twelfth_board,
          achievements = EXCLUDED.achievements,
          linkedin = EXCLUDED.linkedin,
          whatsapp = EXCLUDED.whatsapp,
          phone = EXCLUDED.phone,
          mentor_type = EXCLUDED.mentor_type`,
        [
          name, email, photo || null, field || null, designation || null, city || null, category || null,
          tenth_marks || null, tenth_board || null, twelfth_marks || null, twelfth_board || null,
          achievements || null, linkedin || null, whatsapp || null, phone || null,
          mentor_type || 'mentor_only'
        ]
      );
    }

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
    if (user.status === 'rejected') {
      const reason = user.rejection_reason ? ` Reason: ${user.rejection_reason}` : '';
      return res.status(403).json({ error: `Your verification was rejected.${reason}` });
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
