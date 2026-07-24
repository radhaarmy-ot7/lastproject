const db = require('../config/database');

class AttendanceModel {
    static async markAttendance(admissionNumber, date, status) {
        const [result] = await db.query(
            `INSERT INTO attendance (admission_number, date, status, created_at)
            VALUES (?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE status = ?, updated_at = NOW()`,
            [admissionNumber, date, status, status]
        );
        return result;
    }

    static async getAttendanceByStudent(admissionNumber) {
        const [rows] = await db.query(
            'SELECT * FROM attendance WHERE admission_number = ? ORDER BY date DESC',
            [admissionNumber]
        );
        return rows;
    }

    static async getAttendanceSummary(admissionNumber) {
        const [rows] = await db.query(
            `SELECT
                COUNT(*) as total_days,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days
            FROM attendance
            WHERE admission_number = ?`,
            [admissionNumber]
        );
        return rows[0];
    }

    static async getMonthlyAttendance(admissionNumber, month, year) {
        const [rows] = await db.query(
            `SELECT * FROM attendance
            WHERE admission_number = ?
            AND MONTH(date) = ? AND YEAR(date) = ?
            ORDER BY date DESC`,
            [admissionNumber, month, year]
        );
        return rows;
    }

    static async getAttendancePercentage(admissionNumber) {
        const summary = await this.getAttendanceSummary(admissionNumber);
        if (!summary || summary.total_days === 0) return 0;
        return ((summary.present_days / summary.total_days) * 100).toFixed(2);
    }
}

module.exports = AttendanceModel;