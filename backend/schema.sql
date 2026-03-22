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
    status TEXT DEFAULT 'pending',
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
    twelfth_marks TEXT,
    achievements TEXT,
    whatsapp TEXT,
    email TEXT,
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

-- Sample data for guiders
INSERT INTO guiders (name, photo, field, designation, city, category, tenth_marks, twelfth_marks, achievements, whatsapp, email, phone, contact) VALUES
('Rahul Sharma', 'https://ui-avatars.com/api/?name=Rahul+Sharma&background=1a73e8&color=fff&size=200', 'IIT JEE', 'IIT Delhi Graduate', 'Delhi', 'IIT', '95%', '92%', 'IIT Delhi - Computer Science, AIR 342, Gold Medalist', '+91-9876543210', 'rahul@example.com', '9876543210', '+91-9876543210'),
('Priya Singh', 'https://ui-avatars.com/api/?name=Priya+Singh&background=ff6d00&color=fff&size=200', 'NEET', 'MBBS - AIIMS', 'Mumbai', 'NEET', '97%', '95%', 'AIIMS Delhi - MBBS, NEET AIR 156, State Topper', '+91-9876543211', 'priya@example.com', '9876543211', '+91-9876543211'),
('Amit Kumar', 'https://ui-avatars.com/api/?name=Amit+Kumar&background=1a73e8&color=fff&size=200', 'UPSC', 'IAS Officer', 'Patna', 'UPSC', '88%', '85%', 'IAS 2020 Batch, AIR 47, District Collector', '+91-9876543212', 'amit@example.com', '9876543212', '+91-9876543212'),
('Sunita Devi', 'https://ui-avatars.com/api/?name=Sunita+Devi&background=ff6d00&color=fff&size=200', 'Army', 'Indian Army Officer', 'Jaipur', 'Army', '85%', '82%', 'Captain Indian Army, NDA Graduate, Best Cadet Award', '+91-9876543213', 'sunita@example.com', '9876543213', '+91-9876543213'),
('Vikram Yadav', 'https://ui-avatars.com/api/?name=Vikram+Yadav&background=1a73e8&color=fff&size=200', 'Railway', 'Railway Engineer', 'Lucknow', 'Railway', '90%', '87%', 'RRB JE 2019, Senior Engineer Railways, AIR 89', '+91-9876543214', 'vikram@example.com', '9876543214', '+91-9876543214'),
('Meena Patel', 'https://ui-avatars.com/api/?name=Meena+Patel&background=ff6d00&color=fff&size=200', 'Intermediate', 'Science Teacher', 'Ahmedabad', 'Intermediate', '92%', '94%', 'State Board Topper, Physics Olympiad Winner', '+91-9876543215', 'meena@example.com', '9876543215', '+91-9876543215')
ON CONFLICT DO NOTHING;

-- Sample notifications
INSERT INTO notifications (title, description, link) VALUES
('NEET 2024 Application Form Released', 'National Testing Agency has released the NEET 2024 application form. Last date to apply is March 31, 2024.', 'https://neet.nta.nic.in'),
('JEE Main 2024 Result Announced', 'JEE Main 2024 Session 2 results have been announced. Check your scorecard now.', 'https://jeemain.nta.nic.in'),
('UPSC CSE 2024 Notification Out', 'Union Public Service Commission has released the Civil Services Examination 2024 notification.', 'https://upsc.gov.in'),
('Free Coaching for SC/ST Students', 'Government of India announces free coaching scheme for SC/ST students preparing for competitive exams.', '#'),
('RRB NTPC 2024 Recruitment', 'Railway Recruitment Board announces 11558 vacancies for NTPC posts. Apply before April 30, 2024.', 'https://indianrailways.gov.in')
ON CONFLICT DO NOTHING;

-- Sample resources
INSERT INTO resources (title, category, drive_link, description) VALUES
('NCERT Physics Class 12', 'IIT', 'https://drive.google.com/file/d/example1', 'Complete NCERT Physics textbook for Class 12, essential for JEE preparation'),
('Biology NEET Master Guide', 'NEET', 'https://drive.google.com/file/d/example2', 'Comprehensive Biology guide covering all NEET syllabus topics'),
('UPSC General Studies Notes', 'UPSC', 'https://drive.google.com/file/d/example3', 'Complete GS notes for UPSC Prelims and Mains'),
('Railway Math Practice Set', 'Railway', 'https://drive.google.com/file/d/example4', '500+ practice questions for Railway exams with solutions'),
('Army GD Physical Test Guide', 'Army', 'https://drive.google.com/file/d/example5', 'Complete physical fitness guide for Indian Army GD exam'),
('Matric Science Sample Papers', 'Matric', 'https://drive.google.com/file/d/example6', 'Last 10 years sample papers for Matric Science examination'),
('Intermediate Mathematics', 'Intermediate', 'https://drive.google.com/file/d/example7', 'Complete mathematics guide for Intermediate students')
ON CONFLICT DO NOTHING;

-- Sample tutors
INSERT INTO tutors (name, subject, location, contact, experience) VALUES
('Rajesh Gupta', 'Mathematics & Physics', 'Varanasi, UP', '+91-9812345670', '8 years'),
('Kavita Mishra', 'Biology & Chemistry', 'Patna, Bihar', '+91-9812345671', '5 years'),
('Suresh Tiwari', 'English & Hindi', 'Allahabad, UP', '+91-9812345672', '10 years'),
('Anita Yadav', 'Social Science', 'Gorakhpur, UP', '+91-9812345673', '6 years'),
('Mohit Jha', 'Computer Science', 'Muzaffarpur, Bihar', '+91-9812345674', '4 years')
ON CONFLICT DO NOTHING;

-- Default admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@edusaathi.com', '$2a$10$rQnlT0gCDzNt7NJkuJp5ouge1mU6YTfALOYj5K0.X0.eLe28QREG6', 'admin')
ON CONFLICT DO NOTHING;

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
