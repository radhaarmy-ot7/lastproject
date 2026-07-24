const db = require('../config/database');

class ActivityLogModel {
    static async create(logData) {
        const { teacher_id, action, details } = logData;

        const [result] = await db.query(
            `INSERT INTO activity_logs (teacher_id, action, details, created_at)
            VALUES (?, ?, ?, NOW())`,
            [teacher_id, action, JSON.stringify(details)]
        );
        return result;
    }

    static async findAll() {
        const [rows] = await db.query(
            `SELECT al.*, t.full_name as teacher_name
            FROM activity_logs al
            LEFT JOIN teachers t ON al.teacher_id = t.teacher_id
            ORDER BY al.created_at DESC
            LIMIT 50`
        );
        return rows;
    }

    static async findByTeacher(teacherId) {
        const [rows] = await db.query(
            `SELECT * FROM activity_logs
            WHERE teacher_id = ?
            ORDER BY created_at DESC
            LIMIT 20`,
            [teacherId]
        );
        return rows;
    }

    static async getRecentActivities(limit = 10) {
        const [rows] = await db.query(
            `SELECT al.*, t.full_name as teacher_name
            FROM activity_logs al
            LEFT JOIN teachers t ON al.teacher_id = t.teacher_id
            ORDER BY al.created_at DESC
            LIMIT ?`,
            [limit]
        );
        return rows;
    }

    static async getActivitySummary() {
        const [rows] = await db.query(
            `SELECT 
                action,
                COUNT(*) as count,
                DATE(created_at) as date
            FROM activity_logs
            GROUP BY action, DATE(created_at)
            ORDER BY created_at DESC
            LIMIT 30`
        );
        return rows;
    }

    static async deleteOldLogs(days = 30) {
        const [result] = await db.query(
            'DELETE FROM activity_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
            [days]
        );
        return result;
    }
}

module.exports = ActivityLogModel;