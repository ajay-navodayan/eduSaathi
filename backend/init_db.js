const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDB() {
  // 1. Connect to default 'postgres' db to create 'eduSaathi'
  const defaultClient = new Client({
    connectionString: 'postgresql://postgres:2468@localhost:5432/postgres'
  });
  
  try {
    await defaultClient.connect();
    const checkRes = await defaultClient.query(`SELECT 1 FROM pg_database WHERE datname = 'eduSaathi'`);
    if (checkRes.rowCount === 0) {
      console.log('Creating database "eduSaathi"...');
      await defaultClient.query('CREATE DATABASE "eduSaathi"');
      console.log('Database created.');
    } else {
      console.log('Database "eduSaathi" already exists, running complete setup anyway.');
    }
  } catch (err) {
    console.error('Error in creating DB:', err.message);
    return;
  } finally {
    await defaultClient.end();
  }

  // 2. Connect to the new 'eduSaathi' database and run schema.sql
  const appClient = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await appClient.connect();
    console.log('Connected to eduSaathi. Applying schema...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await appClient.query(schemaSql);
    console.log('SUCCESS! Database tables including "messages" have been created and initialized with sample data.');
  } catch (err) {
    console.error('Error applying schema:', err.message);
  } finally {
    await appClient.end();
  }
}

initDB();
