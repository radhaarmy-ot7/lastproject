-- KV School Management System Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS KV_School_System;
USE KV_School_System;

-- Students table
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
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    joining_date DATE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admission_number INT,
    date DATE,
    status ENUM('present', 'absent', 'late') DEFAULT 'present',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admission_number) REFERENCES students(admission_number) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (admission_number, date)
);

-- Results table
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
);

-- Notices table
CREATE TABLE IF NOT EXISTS notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    teacher_id VARCHAR(50),
    date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE SET NULL
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id VARCHAR(50),
    action VARCHAR(100),
    details JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE
);

-- Deleted students table (for archive)
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
);

-- Create indexes for better performance
CREATE INDEX idx_student_name ON students(full_name);
CREATE INDEX idx_student_class ON students(class);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_results_exam ON results(exam_date);
CREATE INDEX idx_notices_date ON notices(date);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);