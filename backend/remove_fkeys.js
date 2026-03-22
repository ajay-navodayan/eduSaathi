const pool = require('./db');
require('dotenv').config();

async function removeConstraints() {
  try {
    console.log('Removing strict foreign key constraints from messages table so Guiders and Students can message freely...');
    await pool.query('ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey');
    await pool.query('ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey');
    console.log('Successfully dropped restrictive foreign keys!');
  } catch (err) {
    console.error('Failed to remove constraints:', err);
  } finally {
    pool.end();
  }
}

removeConstraints();
