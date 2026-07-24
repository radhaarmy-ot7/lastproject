const db = require('../config/database');
const bcrypt = require('bcrypt');

class TeacherModel {
    static async findByTeacherId(teacherId) {
        const [rows] = await db.query(
            'SELECT * FROM teachers WHERE teacher_id = ?',
            [teacherId]
        );
        return rows[0];
    }

    static async findByTeacherIdWithPassword(teacherId) {
        const [rows] = await db.query(
            'SELECT * FROM teachers WHERE teacher_id = ?',
            [teacherId]
        );
        return rows[0];
    }

    static async findByEmail(email) {
        const [rows] = await db.query(
            'SELECT * FROM teachers WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async createTeacher(teacherData) {
        const {
            teacher_id,
            full_name,
            email,
            phone,
            joining_date,
            password,
            is_verified = false,
            is_active = false
        } = teacherData;

        const [result] = await db.query(
            `INSERT INTO teachers (
                teacher_id, full_name, email, phone, joining_date,
                password, is_verified, is_active, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [teacher_id, full_name, email, phone, joining_date, password, is_verified, is_active]
        );
        return result;
    }

    static async verifyTeacher(email) {
        const [result] = await db.query(
            'UPDATE teachers SET is_verified = TRUE, updated_at = NOW() WHERE email = ?',
            [email]
        );
        return result;
    }

    static async activateTeacher(email) {
        const [result] = await db.query(
            'UPDATE teachers SET is_active = TRUE, updated_at = NOW() WHERE email = ?',
            [email]
        );
        return result;
    }

    static async getNextTeacherId() {
        const [rows] = await db.query(
            'SELECT MAX(CAST(SUBSTRING(teacher_id, 2) AS UNSIGNED)) as max_id FROM teachers'
        );
        const maxId = rows[0].max_id || 0;
        const nextId = maxId + 1;
        return `T${String(nextId).padStart(3, '0')}`;
    }

    static async updateProfile(teacherId, profileData) {
        const { full_name, email, phone, joining_date } = profileData;

        const [result] = await db.query(
            `UPDATE teachers SET
                full_name = ?, email = ?, phone = ?,
                joining_date = ?, updated_at = NOW()
            WHERE teacher_id = ?`,
            [full_name, email, phone, joining_date, teacherId]
        );
        return result;
    }

    static async updatePassword(teacherId, hashedPassword) {
        const [result] = await db.query(
            'UPDATE teachers SET password = ?, updated_at = NOW() WHERE teacher_id = ?',
            [hashedPassword, teacherId]
        );
        return result;
    }

    static async logActivity(teacherId, action, details) {
        const [result] = await db.query(
            `INSERT INTO activity_logs (teacher_id, action, details, created_at)
            VALUES (?, ?, ?, NOW())`,
            [teacherId, action, JSON.stringify(details)]
        );
        return result;
    }

    static async getProfile(teacherId) {
        const [rows] = await db.query(
            `SELECT teacher_id, full_name, email, phone, joining_date, 
                    is_verified, is_active, created_at
            FROM teachers WHERE teacher_id = ?`,
            [teacherId]
        );
        return rows[0];
    }

    static async getAllTeachers() {
        const [rows] = await db.query(
            'SELECT * FROM teachers ORDER BY created_at DESC'
        );
        return rows;
    }

    static async getPendingTeachers() {
        const [rows] = await db.query(
            'SELECT * FROM teachers WHERE is_verified = FALSE OR is_active = FALSE ORDER BY created_at DESC'
        );
        return rows;
    }

    static async deleteTeacher(teacherId) {
        const [result] = await db.query(
            'DELETE FROM teachers WHERE teacher_id = ?',
            [teacherId]
        );
        return result;
    }
}

module.exports = TeacherModel;