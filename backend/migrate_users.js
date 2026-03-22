const pool = require('./db');
require('dotenv').config();

async function migrate() {
    try {
        console.log('Migrating database...');
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_edited BOOLEAN DEFAULT false`);
        
        // Auto-approve existing roles
        await pool.query(`UPDATE users SET status = 'approved' WHERE role = 'admin'`);
        await pool.query(`UPDATE users SET status = 'approved' WHERE role = 'student'`);
        
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        pool.end();
    }
}

migrate();
