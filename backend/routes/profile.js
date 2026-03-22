const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');

// GET /me/:id
router.get('/me/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const userRes = await pool.query('SELECT id, name, email, role, profile_edited FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = userRes.rows[0];

    let guiderData = {};
    if (user.role === 'guider') {
      const gRes = await pool.query('SELECT field, designation, city, category, whatsapp, phone FROM guiders WHERE email = $1', [user.email]);
      if (gRes.rows.length > 0) guiderData = gRes.rows[0];
    }
    res.json({ ...user, ...guiderData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching profile data' });
  }
});

// Helper to check one-time edit rule
router.put('/update', async (req, res) => {
  const { userId, name, field, designation, city, category, whatsapp, phone } = req.body;
  
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    // Check if profile was already edited
    const userRes = await pool.query('SELECT profile_edited, email FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const user = userRes.rows[0];
    if (user.profile_edited) {
      return res.status(403).json({ error: 'Profile locked. You can only edit your profile once. Contact Admin to make further changes.' });
    }

    // Update Users Table
    await pool.query('UPDATE users SET name = $1, profile_edited = true WHERE id = $2', [name, userId]);

    // Upsert into Guiders Table using email for linkage
    const guiderRes = await pool.query('SELECT id FROM guiders WHERE email = $1', [user.email]);
    if (guiderRes.rows.length > 0) {
      // Update existing
      await pool.query(
        'UPDATE guiders SET name=$1, field=$2, designation=$3, city=$4, category=$5, whatsapp=$6, phone=$7 WHERE email=$8',
        [name, field, designation, city, category, whatsapp, phone, user.email]
      );
    } else {
      // Insert new guider profile
      await pool.query(
        'INSERT INTO guiders (name, email, field, designation, city, category, whatsapp, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [name, user.email, field, designation, city, category, whatsapp, phone]
      );
    }

    res.json({ message: 'Profile updated and locked successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

router.put('/change-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const userRes = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error changing password' });
  }
});

module.exports = router;
