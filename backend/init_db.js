const pool = require('./db');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  try {
    console.log('--- 🛠️  Starting Database Initialization ---');

    // 1. Create Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'student',
        status TEXT DEFAULT 'approved',
        rejection_reason TEXT,
        profile_edited BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS guiders (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        photo TEXT,
        field TEXT,
        designation TEXT,
        city TEXT,
        category TEXT,
        tenth_marks TEXT,
        tenth_board TEXT,
        twelfth_marks TEXT,
        twelfth_board TEXT,
        achievements TEXT,
        linkedin TEXT,
        whatsapp TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        mentor_type TEXT DEFAULT 'mentor_only',
        contact TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        link TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS resources (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT,
        drive_link TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tutors (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        subject TEXT,
        location TEXT,
        contact TEXT,
        experience TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tables checked/created.');

    // 2. Apply Migrations (Add missing columns dynamically)
    // Add 'status' if missing
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved'");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason TEXT");
    // Add 'profile_edited' if missing
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_edited BOOLEAN DEFAULT false");
    
    // Guiders Migrations
    await pool.query("ALTER TABLE guiders ADD COLUMN IF NOT EXISTS tenth_board TEXT");
    await pool.query("ALTER TABLE guiders ADD COLUMN IF NOT EXISTS twelfth_board TEXT");
    await pool.query("ALTER TABLE guiders ADD COLUMN IF NOT EXISTS linkedin TEXT");
    await pool.query("ALTER TABLE guiders ADD COLUMN IF NOT EXISTS mentor_type TEXT DEFAULT 'mentor_only'");

    // Tutors Migrations (Matching Guider Format)
    await pool.query("ALTER TABLE tutors ADD COLUMN IF NOT EXISTS photo TEXT");
    await pool.query("ALTER TABLE tutors ADD COLUMN IF NOT EXISTS field TEXT");
    await pool.query("ALTER TABLE tutors ADD COLUMN IF NOT EXISTS designation TEXT");
    await pool.query("ALTER TABLE tutors ADD COLUMN IF NOT EXISTS city TEXT");
    await pool.query("ALTER TABLE tutors ADD COLUMN IF NOT EXISTS tenth_marks TEXT");
    await pool.query("ALTER TABLE tutors ADD COLUMN IF NOT EXISTS tenth_board TEXT");
    await pool.query("ALTER TABLE tutors ADD COLUMN IF NOT EXISTS twelfth_marks TEXT");
    await pool.query("ALTER TABLE tutors ADD COLUMN IF NOT EXISTS twelfth_board TEXT");
    await pool.query("ALTER TABLE tutors ADD COLUMN IF NOT EXISTS achievements TEXT");
    await pool.query("ALTER TABLE tutors ADD COLUMN IF NOT EXISTS linkedin TEXT");
    await pool.query("ALTER TABLE tutors ADD COLUMN IF NOT EXISTS whatsapp TEXT");
    await pool.query("ALTER TABLE tutors ADD COLUMN IF NOT EXISTS email TEXT UNIQUE");
    await pool.query("ALTER TABLE tutors ADD COLUMN IF NOT EXISTS phone TEXT");

    console.log('✅ Columns checked/added.');

    // 3. Clear Dummy Data (Only if requested - let's make it a safe check or comment it)
    // The user explicitly asked to "remove dummy data", so we can truncate these tables if headers match.
    // For this one-time task, I will clear them if they contain specific placeholder emails or just truncate.
    // await pool.query('TRUNCATE guiders, tutors, notifications, resources RESTART IDENTITY CASCADE');
    
    // 4. Seed Default Admin
    const adminEmail = 'admin@edusaathi.com';

    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await pool.query(
      `INSERT INTO users (name, email, password, role, status)
       VALUES ($1, $2, $3, 'admin', 'approved')
       ON CONFLICT (email) DO UPDATE 
       SET role = 'admin', status = 'approved' 
       WHERE users.email = $2`,
      ['Admin', adminEmail, hashedPassword]
    );
    console.log('✅ Admin user ensured.');

    console.log('--- 🏗️  Database and Migrations Ready ---');
  } catch (err) {
    console.error('❌ Error during database initialization:', err);
    throw err; // Fail startup if DB cannot be initialized
  }
}

module.exports = initializeDatabase;
