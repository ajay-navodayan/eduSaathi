const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all pending users
router.get('/pending-users', async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, name, email, role, status, created_at FROM users WHERE status = 'pending'`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching pending users' });
  }
});

// Approve a user
router.put('/approve-user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`UPDATE users SET status = 'approved' WHERE id = $1 RETURNING id, name, email, status`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error approving user' });
  }
});

// Admin forceful profile edit (bypasses one-time rule)
router.put('/edit-user/:id', async (req, res) => {
  const { id } = req.params;
  const { name, field, designation, city, overrideLock } = req.body;
  
  try {
    const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const userEmail = userRes.rows[0].email;

    await pool.query('UPDATE users SET name = $1 WHERE id = $2', [name, id]);
    
    // Attempt update in Guiders
    await pool.query(
      'UPDATE guiders SET name=$1, field=$2, designation=$3, city=$4 WHERE email=$5',
      [name, field, designation, city, userEmail]
    );

    // If admin chooses to unlock the profile for the user
    if (overrideLock) {
      await pool.query('UPDATE users SET profile_edited = false WHERE id = $1', [id]);
    }

    res.json({ message: 'User profile forcefully updated by Admin' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error editing user' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, status, profile_edited, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching all users' });
  }
});

// Add Tutor
router.post('/add-tutor', async (req, res) => {
  const { name, subject, location, contact, experience } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tutors (name, subject, location, contact, experience) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, subject, location, contact, experience]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error adding tutor' });
  }
});

module.exports = router;
