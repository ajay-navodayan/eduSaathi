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

      CREATE TABLE IF NOT EXISTS ai_notifications (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        source_url TEXT,
        published_date TEXT,
        fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(category, title)
      );

      CREATE TABLE IF NOT EXISTS fetch_log (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL UNIQUE,
        last_fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    await pool.query("ALTER TABLE tutors ADD COLUMN IF NOT EXISTS phone TEXT");
    
    // Resources Migrations
    await pool.query("ALTER TABLE resources ADD COLUMN IF NOT EXISTS class_level INTEGER");
    await pool.query("ALTER TABLE resources ADD COLUMN IF NOT EXISTS medium TEXT");

    console.log('✅ Columns checked/added.');

    // 3. Clear Dummy Data & Seed NCERT (Updated to 2026 - FULL EXPANSION 1-12)
    await pool.query('TRUNCATE resources RESTART IDENTITY');
    
    const classPrefixes = {
      1: 'a', 2: 'b', 3: 'c', 4: 'd', 5: 'e', 
      6: 'f', 7: 'g', 8: 'h', 9: 'i', 10: 'j', 
      11: 'k', 12: 'l'
    };

    const subjectMap = [
      // Format: [SubjectName, Code, ClassesArray]
      ['Mathematics', 'mh', [1,2,3,4,5,6,7,8,9,10,11,12]],
      ['Science', 'sc', [6,7,8,9,10]],
      ['English', 'en', [1,2,3,4,5,6,7,8,9,10,11,12]],
      ['Hindi', 'hn', [1,2,3,4,5,6,7,8,9,10,11,12]],
      ['EVS', 'ev', [3,4,5]],
      
      // Science (11-12)
      ['Physics', 'ph', [11,12]],
      ['Chemistry', 'ch', [11,12]],
      ['Biology', 'bi', [11,12]],

      // Commerce (11-12)
      ['Accountancy', 'ac', [11,12]],
      ['Business Studies', 'bs', [11,12]],
      ['Economics', 'ec', [9,10,11,12]],

      // Arts/Humanities (11-12)
      ['History', 'hs', [11,12]],
      ['Geography', 'gy', [11,12]],
      ['Political Science', 'ps', [11,12]],
      ['Sociology', 'sy', [11,12]],
      ['Psychology', 'py', [11,12]],

      // Social Science (6-10 specific codes)
      ['History', 'ss3', [6,7,8,9,10]],
      ['Geography', 'ss1', [6,7,8,9,10]],
      ['Political Science', 'ss4', [6,7,8,9,10]]
    ];

    console.log('--- 📚 Seeding NCERT Classes 1-12 ---');
    for (const [subName, subCode, classes] of subjectMap) {
      for (const cls of classes) {
        const prefix = classPrefixes[cls];
        if (!prefix) continue;

        // Add English Version
        await pool.query(
          'INSERT INTO resources (title, category, drive_link, description, class_level, medium) VALUES ($1, $2, $3, $4, $5, $6)',
          [`${subName} (English)`, 'NCERT', `https://ncert.nic.in/textbook/pdf/${prefix}e${subCode}1dd.zip`, `Class ${cls} - ${subName}`, cls, 'english']
        );

        // Add Hindi Version
        const hindiName = subName === 'Mathematics' ? 'Ganit' : subName === 'Science' ? 'Vigyan' : subName;
        await pool.query(
          'INSERT INTO resources (title, category, drive_link, description, class_level, medium) VALUES ($1, $2, $3, $4, $5, $6)',
          [`${hindiName} (Hindi)`, 'NCERT', `https://ncert.nic.in/textbook/pdf/${prefix}h${subCode}1dd.zip`, `Class ${cls} - ${subName}`, cls, 'hindi']
        );
      }
    }
    console.log('✅ NCERT Seeding Complete.');
    
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
