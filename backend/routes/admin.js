const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all pending users
router.get('/pending-users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id, u.id_auth, u.name, u.email, u.role, u.status, u.created_at, u.profile_edited,
        COALESCE(g.photo, t.photo) AS photo,
        COALESCE(g.field, t.field) AS field,
        COALESCE(g.designation, t.designation) AS designation,
        COALESCE(g.city, t.city) AS city,
        g.category,
        COALESCE(g.tenth_marks, t.tenth_marks) AS tenth_marks,
        COALESCE(g.tenth_board, t.tenth_board) AS tenth_board,
        COALESCE(g.twelfth_marks, t.twelfth_marks) AS twelfth_marks,
        COALESCE(g.twelfth_board, t.twelfth_board) AS twelfth_board,
        COALESCE(g.achievements, t.achievements) AS achievements,
        COALESCE(g.linkedin, t.linkedin) AS linkedin,
        COALESCE(g.whatsapp, t.whatsapp) AS whatsapp,
        COALESCE(g.phone, t.phone) AS phone,
        g.mentor_type
      FROM users u
      LEFT JOIN guiders g ON g.email = u.email
      LEFT JOIN tutors t ON t.email = u.email
      WHERE u.status = 'pending'
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching pending users' });
  }
});

// Approve a user
router.put('/approve-user/:id', async (req, res) => {
  const { id } = req.params; // Expects Supabase UUID (id_auth)
  try {
    const result = await pool.query(`UPDATE users SET status = 'approved', rejection_reason = NULL WHERE id_auth = $1 RETURNING id, id_auth, name, email, status`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error approving user' });
  }
});

// Reject a user with reason
router.put('/reject-user/:id', async (req, res) => {
  const { id } = req.params; // Expects Supabase UUID (id_auth)
  const { reason } = req.body;
  const cleanedReason = String(reason || '').trim();
  if (!cleanedReason) {
    return res.status(400).json({ error: 'Rejection reason is required' });
  }
  try {
    const result = await pool.query(
      `UPDATE users SET status = 'rejected', rejection_reason = $1 WHERE id_auth = $2 RETURNING id, id_auth, name, email, status, rejection_reason`,
      [cleanedReason, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error rejecting user' });
  }
});

// Admin forceful profile edit (bypasses one-time rule)
router.put('/edit-user/:id', async (req, res) => {
  const { id } = req.params; // Expects Supabase UUID (id_auth)
  const { 
    name, photo, field, designation, city, 
    tenth_marks, tenth_board, twelfth_marks, twelfth_board,
    achievements, linkedin, whatsapp, phone, mentor_type,
    overrideLock 
  } = req.body;
  
  try {
    const userRes = await pool.query('SELECT email, role FROM users WHERE id_auth = $1', [id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const { email: userEmail, role } = userRes.rows[0];

    await pool.query('UPDATE users SET name = $1 WHERE id_auth = $2', [name, id]);
    
    // Update appropriate table based on role
    if (role === 'guider') {
      await pool.query(
        `UPDATE guiders SET 
          name=$1, photo=$2, field=$3, designation=$4, city=$5, 
          tenth_marks=$6, tenth_board=$7, twelfth_marks=$8, twelfth_board=$9,
          achievements=$10, linkedin=$11, whatsapp=$12, phone=$13, mentor_type=$14
         WHERE email=$15`,
        [
          name, photo, field, designation, city, 
          tenth_marks, tenth_board, twelfth_marks, twelfth_board,
          achievements, linkedin, whatsapp, phone, mentor_type || 'mentor_only', userEmail
        ]
      );
    } else if (role === 'tutor') {
      await pool.query(
        `UPDATE tutors SET 
          name=$1, photo=$2, field=$3, designation=$4, city=$5, 
          tenth_marks=$6, tenth_board=$7, twelfth_marks=$8, twelfth_board=$9,
          achievements=$10, linkedin=$11, whatsapp=$12, phone=$13
         WHERE email=$14`,
        [
          name, photo, field, designation, city, 
          tenth_marks, tenth_board, twelfth_marks, twelfth_board,
          achievements, linkedin, whatsapp, phone, userEmail
        ]
      );
    }

    // If admin chooses to unlock the profile for the user
    if (overrideLock) {
      await pool.query('UPDATE users SET profile_edited = false WHERE id_auth = $1', [id]);
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
    const result = await pool.query('SELECT id, id_auth, name, email, role, status, profile_edited, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching all users' });
  }
});

// Add Tutor (Automated Supabase Auth Creation)
router.post('/add-tutor', async (req, res) => {
  const { 
    name, photo, field, designation, city,
    tenth_marks, tenth_board, twelfth_marks, twelfth_board,
    achievements, linkedin, whatsapp, phone, email 
  } = req.body;
  
  const tempPassword = 'welcome123';
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. Create User Account in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: name, role: 'tutor' }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('User already exists in Auth, continuing to profile check...');
      } else {
        throw authError;
      }
    }

    // 2. Create Tutor Profile in public.tutors
    const result = await pool.query(
      `INSERT INTO tutors (
        name, photo, field, designation, city, 
        tenth_marks, tenth_board, twelfth_marks, twelfth_board, 
        achievements, linkedin, whatsapp, phone, email
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) 
      ON CONFLICT (email) DO UPDATE SET
        name=EXCLUDED.name, photo=EXCLUDED.photo, field=EXCLUDED.field,
        designation=EXCLUDED.designation, city=EXCLUDED.city
      RETURNING *`,
      [
        name, photo, field, designation, city, 
        tenth_marks, tenth_board, twelfth_marks, twelfth_board, 
        achievements, linkedin, whatsapp, phone, email
      ]
    );

    res.status(201).json({ 
      message: 'Tutor account synchronized with Supabase successfully', 
      tutor: result.rows[0],
      tempPassword 
    });
  } catch (err) {
    console.error('Add Tutor Error:', err.message);
    res.status(500).json({ error: err.message || 'Server error adding tutor' });
  }
});

module.exports = router;
