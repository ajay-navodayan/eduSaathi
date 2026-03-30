const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');

// Change Admin Password
router.put('/change-password', async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;
  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1 AND role = $2', [userId, 'admin']);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found or unauthorized' });
    }

    const user = userRes.rows[0];

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect old password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, userId]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password Change Error:', err);
    res.status(500).json({ error: 'Server error changing password' });
  }
});

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
router.put('/approve/:id', async (req, res) => {
  const { id } = req.params; // Expects ID (integer or UUID handled by backend)
  try {
    const result = await pool.query(`UPDATE users SET status = 'approved', rejection_reason = NULL WHERE id = $1 OR id_auth = $2::text RETURNING id, id_auth, name, email, status`, [isNaN(Number(id)) ? -1 : Number(id), id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error approving user' });
  }
});

// Reject a user with reason
router.delete('/reject/:id', async (req, res) => {
  const { id } = req.params; // Expects ID
  try {
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 OR id_auth = $2::text RETURNING id, id_auth`,
      [isNaN(Number(id)) ? -1 : Number(id), id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User rejection and deletion successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error rejecting/deleting user' });
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

// Get all users with full profiles (Optimized JOIN)
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.*,
        COALESCE(g.photo, t.photo) as profile_photo,
        COALESCE(g.field, t.field) as field,
        COALESCE(g.designation, t.designation) as designation,
        COALESCE(g.city, t.city) as city,
        g.category,
        COALESCE(g.whatsapp, t.whatsapp) as whatsapp,
        COALESCE(g.phone, t.phone) as phone,
        COALESCE(g.linkedin, t.linkedin) as linkedin,
        COALESCE(g.tenth_marks, t.tenth_marks) as tenth_marks,
        COALESCE(g.twelfth_marks, t.twelfth_marks) as twelfth_marks,
        g.mentor_type
      FROM users u
      LEFT JOIN guiders g ON g.email = u.email
      LEFT JOIN tutors t ON t.email = u.email
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching detailed users' });
  }
});

// Delete user permanently (DB + Supabase)
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params; // Expects integer ID
  try {
    // 1. Get auth_id before deleting
    const userRes = await pool.query('SELECT email, id_auth FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const { email, id_auth } = userRes.rows[0];

    // 2. Delete from Supabase Auth
    const { createClient } = require('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    if (id_auth) {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id_auth);
      if (authError) {
        console.warn('Supabase Auth deletion failed:', authError.message);
        // We continue anyway to clean up local DB
      }
    }

    // 3. Delete from local tables (Cascade delete should handle profiles if configured correctly, otherwise manual)
    await pool.query('DELETE FROM guiders WHERE email = $1', [email]);
    await pool.query('DELETE FROM tutors WHERE email = $1', [email]);
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({ message: 'User successfully removed from system' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error deleting user' });
  }
});

// Lock/Unlock profile
router.put('/lock-profile/:id', async (req, res) => {
  const { id } = req.params;
  const { profile_edited } = req.body;
  try {
    await pool.query('UPDATE users SET profile_edited = $1 WHERE id = $2', [profile_edited, id]);
    res.json({ message: 'Lock status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle lock' });
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

// Update user role
router.put('/users/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role: newRole } = req.body;
  if (!['admin', 'guider', 'tutor', 'student'].includes(newRole)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  try {
    // 1. Get current role and email
    const userRes = await pool.query('SELECT email, role as old_role FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const { email, old_role: oldRole } = userRes.rows[0];

    // 2. Handle profile migration if roles are changing between guider/tutor
    if (oldRole === 'tutor' && newRole === 'guider') {
      const tutorProfile = await pool.query('SELECT * FROM tutors WHERE email = $1', [email]);
      if (tutorProfile.rows.length > 0) {
        const p = tutorProfile.rows[0];
        await pool.query(`
          INSERT INTO guiders (
            name, photo, field, designation, city, category, 
            tenth_marks, tenth_board, twelfth_marks, twelfth_board, 
            achievements, linkedin, whatsapp, phone, email, mentor_type, contact
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
          ON CONFLICT (email) DO UPDATE SET
            name=EXCLUDED.name, photo=EXCLUDED.photo, field=EXCLUDED.field,
            designation=EXCLUDED.designation, city=EXCLUDED.city, category=EXCLUDED.category,
            tenth_marks=EXCLUDED.tenth_marks, tenth_board=EXCLUDED.tenth_board,
            twelfth_marks=EXCLUDED.twelfth_marks, twelfth_board=EXCLUDED.twelfth_board,
            achievements=EXCLUDED.achievements, linkedin=EXCLUDED.linkedin,
            whatsapp=EXCLUDED.whatsapp, phone=EXCLUDED.phone, contact=EXCLUDED.contact
        `, [
          p.name, p.photo, p.field || p.subject, p.designation || p.experience, p.city || p.location, p.field || p.subject,
          p.tenth_marks, p.tenth_board, p.twelfth_marks, p.twelfth_board,
          p.achievements, p.linkedin, p.whatsapp, p.phone, email, 'mentor_only', p.contact
        ]);
        await pool.query('DELETE FROM tutors WHERE email = $1', [email]);
      }
    } else if (oldRole === 'guider' && newRole === 'tutor') {
      const guiderProfile = await pool.query('SELECT * FROM guiders WHERE email = $1', [email]);
      if (guiderProfile.rows.length > 0) {
        const p = guiderProfile.rows[0];
        await pool.query(`
          INSERT INTO tutors (
            name, photo, field, designation, city, 
            tenth_marks, tenth_board, twelfth_marks, twelfth_board, 
            achievements, linkedin, whatsapp, phone, email, subject, location, contact, experience
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
          ON CONFLICT (email) DO UPDATE SET
            name=EXCLUDED.name, photo=EXCLUDED.photo, field=EXCLUDED.field,
            designation=EXCLUDED.designation, city=EXCLUDED.city,
            tenth_marks=EXCLUDED.tenth_marks, tenth_board=EXCLUDED.tenth_board,
            twelfth_marks=EXCLUDED.twelfth_marks, twelfth_board=EXCLUDED.twelfth_board,
            achievements=EXCLUDED.achievements, linkedin=EXCLUDED.linkedin,
            whatsapp=EXCLUDED.whatsapp, phone=EXCLUDED.phone,
            subject=EXCLUDED.subject, location=EXCLUDED.location, contact=EXCLUDED.contact, experience=EXCLUDED.experience
        `, [
          p.name, p.photo, p.field, p.designation, p.city,
          p.tenth_marks, p.tenth_board, p.twelfth_marks, p.twelfth_board,
          p.achievements, p.linkedin, p.whatsapp, p.phone, email,
          p.field, p.city, p.contact, p.designation
        ]);
        await pool.query('DELETE FROM guiders WHERE email = $1', [email]);
      }
    }

    // 3. Update the role in users table
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [newRole, id]);
    res.json({ message: 'User role updated and profile migrated successfully' });
  } catch (err) {
    console.error('Role update error:', err);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

module.exports = router;
