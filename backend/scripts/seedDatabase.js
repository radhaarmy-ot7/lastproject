const bcrypt = require('bcrypt');
const db = require('../config/database');
const logger = require('../utils/loggerService');

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');

        // Create tables if not exists
        await createTables();

        // Seed default teacher
        await seedTeachers();

        // Seed sample students
        await seedStudents();

        console.log('✅ Database seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        logger.error('Database seeding failed:', error);
        process.exit(1);
    }
}

async function createTables() {
    console.log('📋 Creating tables...');
    
    // Drop existing tables to start fresh
    try {
        await db.query('DROP TABLE IF EXISTS activity_logs');
        await db.query('DROP TABLE IF EXISTS notices');
        await db.query('DROP TABLE IF EXISTS results');
        await db.query('DROP TABLE IF EXISTS attendance');
        await db.query('DROP TABLE IF EXISTS deleted_students');
        await db.query('DROP TABLE IF EXISTS students');
        await db.query('DROP TABLE IF EXISTS teachers');
    } catch (error) {
        console.log('⚠️ Some tables may not exist yet, continuing...');
    }
    
    // Teachers table with email column
    await db.query(`
        CREATE TABLE IF NOT EXISTS teachers (
            teacher_id VARCHAR(50) PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(20),
            joining_date DATE,
            password VARCHAR(255) NOT NULL,
            is_verified BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Students table
    await db.query(`
        CREATE TABLE IF NOT EXISTS students (
            admission_number INT PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            father_name VARCHAR(255),
            mother_name VARCHAR(255),
            date_of_birth DATE,
            class VARCHAR(50),
            address TEXT,
            phone_number VARCHAR(20),
            father_occupation VARCHAR(255),
            mother_occupation VARCHAR(255),
            joining_date DATE,
            password VARCHAR(255) NOT NULL,
            is_deleted BOOLEAN DEFAULT FALSE,
            deleted_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Attendance table
    await db.query(`
        CREATE TABLE IF NOT EXISTS attendance (
            id INT AUTO_INCREMENT PRIMARY KEY,
            admission_number INT,
            date DATE,
            status ENUM('present', 'absent', 'late') DEFAULT 'present',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (admission_number) REFERENCES students(admission_number) ON DELETE CASCADE,
            UNIQUE KEY unique_attendance (admission_number, date)
        )
    `);

    // Results table
    await db.query(`
        CREATE TABLE IF NOT EXISTS results (
            id INT AUTO_INCREMENT PRIMARY KEY,
            admission_number INT,
            subject VARCHAR(100),
            marks DECIMAL(5,2),
            total_marks DECIMAL(5,2),
            grade VARCHAR(10),
            exam_type VARCHAR(50),
            exam_date DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (admission_number) REFERENCES students(admission_number) ON DELETE CASCADE
        )
    `);

    // Notices table
    await db.query(`
        CREATE TABLE IF NOT EXISTS notices (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT,
            teacher_id VARCHAR(50),
            date DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE SET NULL
        )
    `);

    // Activity logs table
    await db.query(`
        CREATE TABLE IF NOT EXISTS activity_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            teacher_id VARCHAR(50),
            action VARCHAR(100),
            details JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE
        )
    `);

    // Deleted students table
    await db.query(`
        CREATE TABLE IF NOT EXISTS deleted_students (
            admission_number INT PRIMARY KEY,
            full_name VARCHAR(255),
            father_name VARCHAR(255),
            mother_name VARCHAR(255),
            date_of_birth DATE,
            class VARCHAR(50),
            address TEXT,
            phone_number VARCHAR(20),
            father_occupation VARCHAR(255),
            mother_occupation VARCHAR(255),
            joining_date DATE,
            deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('✅ All tables created successfully');
}

async function seedTeachers() {
    console.log('👨‍🏫 Seeding teachers...');

    const hashedPassword = await bcrypt.hash('teacher123', 10);

    const teachers = [
        { 
            teacher_id: 'T001', 
            full_name: 'John Doe', 
            email: 'john.doe@kv.edu',
            phone: '1234567890', 
            joining_date: '2024-01-01' 
        },
        { 
            teacher_id: 'T002', 
            full_name: 'Jane Smith', 
            email: 'jane.smith@kv.edu',
            phone: '9876543210', 
            joining_date: '2024-01-15' 
        }
    ];

    for (const teacher of teachers) {
        await db.query(
            `INSERT IGNORE INTO teachers (
                teacher_id, full_name, email, phone, joining_date, 
                password, is_verified, is_active, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, TRUE, TRUE, NOW())`,
            [teacher.teacher_id, teacher.full_name, teacher.email, teacher.phone, teacher.joining_date, hashedPassword]
        );
        console.log(`✅ Teacher ${teacher.teacher_id} seeded`);
    }
}

async function seedStudents() {
    console.log('👨‍🎓 Seeding students...');

    const hashedPassword = await bcrypt.hash('15000', 10);

    const students = [
        {
            admission_number: 15000,
            full_name: 'Rahul Sharma',
            father_name: 'Rajesh Sharma',
            mother_name: 'Priya Sharma',
            date_of_birth: '2010-05-15',
            class: '8',
            address: '123 Main Street, Delhi',
            phone_number: '9876543210',
            father_occupation: 'Engineer',
            mother_occupation: 'Teacher',
            joining_date: '2024-01-15'
        },
        {
            admission_number: 15001,
            full_name: 'Priya Patel',
            father_name: 'Mukesh Patel',
            mother_name: 'Smita Patel',
            date_of_birth: '2011-03-20',
            class: '7',
            address: '456 Park Avenue, Mumbai',
            phone_number: '8765432109',
            father_occupation: 'Doctor',
            mother_occupation: 'Nurse',
            joining_date: '2024-01-15'
        },
        {
            admission_number: 15002,
            full_name: 'Amit Kumar',
            father_name: 'Sunil Kumar',
            mother_name: 'Neha Kumar',
            date_of_birth: '2009-11-10',
            class: '9',
            address: '789 Lake View, Bangalore',
            phone_number: '7654321098',
            father_occupation: 'Software Engineer',
            mother_occupation: 'Homemaker',
            joining_date: '2024-01-15'
        }
    ];

    for (const student of students) {
        await db.query(
            `INSERT IGNORE INTO students (
                admission_number, full_name, father_name, mother_name,
                date_of_birth, class, address, phone_number,
                father_occupation, mother_occupation, joining_date,
                password, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                student.admission_number, student.full_name, student.father_name,
                student.mother_name, student.date_of_birth, student.class,
                student.address, student.phone_number, student.father_occupation,
                student.mother_occupation, student.joining_date, hashedPassword
            ]
        );
        console.log(`✅ Student ${student.admission_number} seeded`);
    }
}

// Run seeding
seedDatabase();