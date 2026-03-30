const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pool = require('../db');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    // 1. Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) throw new Error('Invalid token');

    // 2. Fetch additional profile info (like role) from our public schema
    const profileRes = await pool.query('SELECT id, role, name FROM users WHERE id_auth = $1', [user.id]);
    
    if (profileRes.rows.length === 0) {
      // If user exists in Auth but not in Public (rare sync issue), provide default student role
      req.user = { id: user.id, email: user.email, role: 'student', name: user.user_metadata?.full_name || 'User' };
    } else {
      const dbUser = profileRes.rows[0];
      req.user = { 
        id: dbUser.id, 
        id_auth: user.id, 
        email: user.email, 
        role: dbUser.role, 
        name: dbUser.name 
      };
    }
    
    next();
  } catch (err) {
    console.error('Auth Error:', err.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
