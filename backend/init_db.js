const pool = require('./db');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  try {
    console.log('--- 🛠️  Starting Database Initialization ---');

    // 1. Create Tables & Functions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        id_auth UUID UNIQUE,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
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
        class_level INTEGER,
        medium TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tutors (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        subject TEXT,
        location TEXT,
        contact TEXT,
        experience TEXT,
        photo TEXT,
        field TEXT,
        designation TEXT,
        city TEXT,
        tenth_marks TEXT,
        tenth_board TEXT,
        twelfth_marks TEXT,
        twelfth_board TEXT,
        achievements TEXT,
        linkedin TEXT,
        whatsapp TEXT,
        email TEXT UNIQUE,
        phone TEXT,
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

      -- Better Sync Function
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        -- Log attempt (visible in Supabase logs)
        RAISE NOTICE 'Syncing user: %', new.email;

        -- 1. If user with this email exists, update their id_auth
        UPDATE public.users 
        SET id_auth = new.id,
            name = COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', name)
        WHERE email = new.email;

        -- 2. If no user with this email existed, insert them
        IF NOT FOUND THEN
          INSERT INTO public.users (id_auth, name, email, role, status)
          VALUES (
            new.id,
            COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User'),
            new.email,
            COALESCE(new.raw_user_meta_data->>'role', 'student'),
            'approved'
          );
        END IF;

        RETURN new;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Sync failed for %: %', new.email, SQLERRM;
        RETURN new; -- Still return new to allow Auth creation even if public sync fails
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
    `);

    try {
      await pool.query(`
        -- Grant full access to all roles for simplicity during migration
        GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
        GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
        GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;

        -- Force disable RLS on all critical tables
        ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
        ALTER TABLE public.guiders DISABLE ROW LEVEL SECURITY;
        ALTER TABLE public.resources DISABLE ROW LEVEL SECURITY;
        ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
        ALTER TABLE public.tutors DISABLE ROW LEVEL SECURITY;
        ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

        -- Also add a permissive policy just in case DISABLE RLS is overridden
        DO $$
        BEGIN
          DROP POLICY IF EXISTS "Allow all" ON public.users;
          CREATE POLICY "Allow all" ON public.users FOR ALL USING (true);
        END $$;

        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
            CREATE TRIGGER on_auth_user_created
              AFTER INSERT ON auth.users
              FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
          END IF;
        END $$;
      `);
      console.log('✅ Auth synchronization trigger and permissions ensured.');
    } catch (e) {
      console.log('⚠️ Note: Trigger setup skipped:', e.message);
    }

    // 3. Apply Column Migrations
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS id_auth UUID UNIQUE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_edited BOOLEAN DEFAULT false;
      ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
      ALTER TABLE guiders ADD COLUMN IF NOT EXISTS tenth_board TEXT;
      ALTER TABLE guiders ADD COLUMN IF NOT EXISTS twelfth_board TEXT;
      ALTER TABLE guiders ADD COLUMN IF NOT EXISTS linkedin TEXT;
      ALTER TABLE guiders ADD COLUMN IF NOT EXISTS mentor_type TEXT DEFAULT 'mentor_only';
      ALTER TABLE tutors ADD COLUMN IF NOT EXISTS photo TEXT;
      ALTER TABLE tutors ADD COLUMN IF NOT EXISTS field TEXT;
      ALTER TABLE tutors ADD COLUMN IF NOT EXISTS designation TEXT;
      ALTER TABLE tutors ADD COLUMN IF NOT EXISTS city TEXT;
      ALTER TABLE resources ADD COLUMN IF NOT EXISTS class_level INTEGER;
      ALTER TABLE resources ADD COLUMN IF NOT EXISTS medium TEXT;

      -- Support UUIDs for messaging (removed lingering drop to ensure messages table persists)
    `);
    console.log('✅ Column migrations applied.');

    // 4. Seed Data
    await pool.query('TRUNCATE resources RESTART IDENTITY');

    const NCERT_DATA = [
      { name: 'Mathematics', classes: [1, 2], engCode: 'jm', hinCode: 'ga' },
      { name: 'Mathematics', classes: [3, 4, 5, 6, 7, 8, 9, 11, 12], engCode: 'ma', hinCode: 'ma' },
      { name: 'Mathematics', classes: [10], engCode: 'me', hinCode: 'me' },
      { name: 'Science', classes: [6, 7, 8, 9, 10], engCode: 'sc', hinCode: 'sc' },
      { name: 'Physics', classes: [11, 12], engCode: 'ph', hinCode: 'ph' },
      { name: 'Chemistry', classes: [11, 12], engCode: 'ch', hinCode: 'ch' },
      { name: 'Biology', classes: [11, 12], engCode: 'bi', hinCode: 'bi' },
      { name: 'EVS', classes: [3, 4, 5], engCode: 'ev', hinCode: 'ev' },
      { name: 'History', classes: [6, 7, 8, 9, 10], engCode: 'ss3', hinCode: 'ss3' },
      { name: 'Geography', classes: [6, 7, 8, 9, 10], engCode: 'ss1', hinCode: 'ss1' },
      { name: 'Political Science', classes: [6, 7, 8, 9, 10], engCode: 'ss4', hinCode: 'ss4' },
      { name: 'Economics', classes: [9, 10], engCode: 'ss2', hinCode: 'ss2' }
    ];

    const classPrefixes = {
      1: 'a', 2: 'b', 3: 'c', 4: 'd', 5: 'e', 6: 'f', 7: 'g', 8: 'h', 9: 'i', 10: 'j', 11: 'k', 12: 'l'
    };

    for (const sub of NCERT_DATA) {
      for (const cls of sub.classes) {
        const prefix = classPrefixes[cls];
        if (!prefix) continue;

        const engBookCode = `${prefix}e${sub.engCode}1`;
        await pool.query(
          'INSERT INTO resources (title, category, drive_link, description, class_level, medium) VALUES ($1, $2, $3, $4, $5, $6)',
          [`${sub.name} (English)`, 'NCERT', `https://ncert.nic.in/textbook/pdf/${engBookCode}dd.zip`, `Class ${cls} - ${sub.name}`, cls, 'english']
        );

        let hinBookCode;
        if (cls === 10 && sub.name === 'Mathematics') {
          hinBookCode = `jemh1`;
        } else if (cls <= 2) {
          hinBookCode = `${prefix}e${sub.hinCode}1`;
        } else {
          hinBookCode = `${prefix}h${sub.hinCode}1`;
        }

        const hindiDisplayName = sub.name === 'Mathematics' ? 'Ganit' : sub.name === 'Science' ? 'Vigyan' : sub.name === 'Physics' ? 'Bhautiki' : sub.name === 'Chemistry' ? 'Rasayan' : sub.name;

        await pool.query(
          'INSERT INTO resources (title, category, drive_link, description, class_level, medium) VALUES ($1, $2, $3, $4, $5, $6)',
          [`${hindiDisplayName} (Hindi)`, 'NCERT', `https://ncert.nic.in/textbook/pdf/${hinBookCode}dd.zip`, `Class ${cls} - ${sub.name}`, cls, 'hindi']
        );
      }
    }

    const compResources = [
      { title: 'HC Verma - Concepts of Physics Vol 1', category: 'JEE', link: 'https://readyourflow.com/download-hc-verma-concepts-of-physics-volume-1-2022-23/#page1', desc: 'Reference for JEE/NEET Physics', cls: 11, med: 'english' },
      { title: 'HC Verma - Concepts of Physics Vol 2', category: 'JEE', link: 'https://readyourflow.com/hc-verma-concepts-of-physics-volume-2-2022-23/#page1', desc: 'Reference for JEE/NEET Physics', cls: 12, med: 'english' }
    ];

    for (const r of compResources) {
      await pool.query(
        'INSERT INTO resources (title, category, drive_link, description, class_level, medium) VALUES ($1, $2, $3, $4, $5, $6)',
        [r.title, r.category, r.link, r.desc, r.cls, r.med]
      );
    }
    console.log('✅ Resources seeded.');

    // 5. Admin Sync/Creation (Automated for Supabase Auth)
    const adminEmail = 'admin@edusaathi.com';
    const adminPass = 'admin123';

    // If we have Supabase Role Key, ensure admin exists in Auth too
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient } = require('@supabase/supabase-js');
        const supabaseAdmin = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        console.log('🔗 Ensuring Admin exists in Supabase Auth...');
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: adminEmail,
          password: adminPass,
          email_confirm: true,
          user_metadata: { full_name: 'Platform Admin', role: 'admin' }
        });

        if (authError && !authError.message.includes('already registered')) {
          console.error('⚠️ Could not create Admin in Auth:', authError.message);
        } else {
          console.log('✅ Admin initialized in Supabase Auth.');
        }
      } catch (e) {
        console.log('⚠️ Supabase Admin client failed (might be expected in some environments):', e.message);
      }
    }

    // Always ensure Admin exists in public.users with correct role and sync its id_auth
    let finalAuthId = null;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient } = require('@supabase/supabase-js');
        const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
        const adminUser = userData?.users?.find(u => u.email === adminEmail);
        if (adminUser) finalAuthId = adminUser.id;
      } catch (e) { console.log('⚠️ Sync helper failed:', e.message); }
    }

    await pool.query(
      `INSERT INTO users (name, email, role, status, id_auth)
       VALUES ($1, $2, 'admin', 'approved', $3)
       ON CONFLICT (email) DO UPDATE 
       SET role = 'admin', status = 'approved', id_auth = COALESCE($3, users.id_auth)`,
      ['Admin', adminEmail, finalAuthId]
    );
    console.log('✅ Admin user record ensured and linked in public.users.');

    console.log('--- 🏗️  Database and Migrations Ready ---');
  } catch (err) {
    console.error('❌ Error during database initialization:', err);
    throw err;
  }
}

module.exports = initializeDatabase;
