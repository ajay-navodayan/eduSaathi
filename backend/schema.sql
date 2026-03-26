-- EduSaathi Database Setup
-- Run this script to initialize the database

-- Create database (run manually if needed)
-- SELECT 'CREATE DATABASE "eduSaathi"' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'eduSaathi')\gexec

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    status TEXT DEFAULT 'approved',
    profile_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Guiders table
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
    contact TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT,
    drive_link TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tutors table
CREATE TABLE IF NOT EXISTS tutors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT,
    location TEXT,
    contact TEXT,
    experience TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default admin user (password: admin123)
-- Inserted automatically via init_db.js

