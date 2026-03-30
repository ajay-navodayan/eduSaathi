const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');

// GET /me/:id (Supports both internal integer ID and Supabase UUID)
router.get('/me/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let userRes;
    
    // Check if ID is likely a UUID (Supabase ID) or an integer
    if (isNaN(Number(id))) {
      // It's a string, likely UUID
      userRes = await pool.query('SELECT id, name, email, role, profile_edited FROM users WHERE id_auth = $1', [id]);
    } else {
      // It's an integer
      userRes = await pool.query('SELECT id, name, email, role, profile_edited FROM users WHERE id = $1', [Number(id)]);
    }

    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = userRes.rows[0];

    let profileData = {};
    if (user.role === 'guider' || user.role === 'tutor') {
      const table = user.role === 'guider' ? 'guiders' : 'tutors';
      const pRes = await pool.query(`SELECT * FROM ${table} WHERE email = $1`, [user.email]);
      if (pRes.rows.length > 0) profileData = pRes.rows[0];
    }
    
    res.json({ ...user, ...profileData });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: 'Server error fetching profile data' });
  }
});


// Helper to check one-time edit rule
router.put('/update', async (req, res) => {
  const { 
    userId, name, photo, field, designation, city, category, 
    tenth_marks, tenth_board, twelfth_marks, twelfth_board,
    achievements, linkedin, whatsapp, phone, mentor_type
  } = req.body;
  
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    // Check if profile was already edited
    const userRes = await pool.query('SELECT profile_edited, email, role FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const { profile_edited, email: userEmail, role } = userRes.rows[0];
    
    // One-time edit rule (DOES NOT apply to students)
    if (role !== 'student' && profile_edited) {
      return res.status(403).json({ error: 'Profile locked. You can only edit your profile once. Contact Admin to make further changes.' });
    }

    // Update Users Table (Common fields for all roles)
    await pool.query(
      `UPDATE users SET 
        name = $1, 
        photo = $2, 
        class_level = $3, 
        school = $4, 
        bio = $5, 
        phone = $6,
        profile_edited = true 
       WHERE id = $7`, 
      [name, photo, req.body.class_level || '', req.body.school || '', req.body.bio || '', phone || '', userId]
    );

    // Upsert into Guiders or Tutors Table
    if (role === 'guider') {
      const guiderRes = await pool.query('SELECT id FROM guiders WHERE email = $1', [userEmail]);
      if (guiderRes.rows.length > 0) {
        await pool.query(
          `UPDATE guiders SET 
            name=$1, photo=$2, field=$3, designation=$4, city=$5, category=$6, 
            tenth_marks=$7, tenth_board=$8, twelfth_marks=$9, twelfth_board=$10,
            achievements=$11, linkedin=$12, whatsapp=$13, phone=$14, mentor_type=$15
           WHERE email=$16`,
          [
            name, photo, field, designation, city, category, 
            tenth_marks, tenth_board, twelfth_marks, twelfth_board,
            achievements, linkedin, whatsapp, phone, mentor_type || 'mentor_only', userEmail
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO guiders (
            name, email, photo, field, designation, city, category, 
            tenth_marks, tenth_board, twelfth_marks, twelfth_board,
            achievements, linkedin, whatsapp, phone, mentor_type
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
          [
            name, userEmail, photo, field, designation, city, category, 
            tenth_marks, tenth_board, twelfth_marks, twelfth_board,
            achievements, linkedin, whatsapp, phone, mentor_type || 'mentor_only'
          ]
        );
      }
    } else if (role === 'tutor') {
      const tutorRes = await pool.query('SELECT id FROM tutors WHERE email = $1', [userEmail]);
      if (tutorRes.rows.length > 0) {
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
      } else {
        await pool.query(
          `INSERT INTO tutors (
            name, email, photo, field, designation, city, 
            tenth_marks, tenth_board, twelfth_marks, twelfth_board,
            achievements, linkedin, whatsapp, phone
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
          [
            name, userEmail, photo, field, designation, city, 
            tenth_marks, tenth_board, twelfth_marks, twelfth_board,
            achievements, linkedin, whatsapp, phone
          ]
        );
      }
    }

    const message = role === 'student' 
      ? 'Profile updated successfully.' 
      : 'Profile updated and locked successfully.';
    res.json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

module.exports = router;
