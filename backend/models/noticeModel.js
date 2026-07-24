const db = require('../config/database');

class NoticeModel {
    static async create(noticeData) {
        const { title, content, teacher_id, date } = noticeData;

        const [result] = await db.query(
            `INSERT INTO notices (title, content, teacher_id, date, created_at)
            VALUES (?, ?, ?, ?, NOW())`,
            [title, content, teacher_id, date]
        );
        return result;
    }

    static async findAll() {
        const [rows] = await db.query(
            `SELECT n.*, t.full_name as teacher_name
            FROM notices n
            LEFT JOIN teachers t ON n.teacher_id = t.teacher_id
            ORDER BY n.date DESC`
        );
        return rows;
    }

    static async findById(noticeId) {
        const [rows] = await db.query(
            `SELECT n.*, t.full_name as teacher_name
            FROM notices n
            LEFT JOIN teachers t ON n.teacher_id = t.teacher_id
            WHERE n.id = ?`,
            [noticeId]
        );
        return rows[0];
    }

    static async update(noticeId, noticeData) {
        const { title, content, date } = noticeData;

        const [result] = await db.query(
            `UPDATE notices SET title = ?, content = ?, date = ?, updated_at = NOW()
            WHERE id = ?`,
            [title, content, date, noticeId]
        );
        return result;
    }

    static async delete(noticeId) {
        const [result] = await db.query(
            'DELETE FROM notices WHERE id = ?',
            [noticeId]
        );
        return result;
    }

    static async getRecentNotices(limit = 5) {
        const [rows] = await db.query(
            `SELECT n.*, t.full_name as teacher_name
            FROM notices n
            LEFT JOIN teachers t ON n.teacher_id = t.teacher_id
            ORDER BY n.date DESC
            LIMIT ?`,
            [limit]
        );
        return rows;
    }
}

module.exports = NoticeModel;