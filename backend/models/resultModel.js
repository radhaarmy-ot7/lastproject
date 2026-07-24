const db = require('../config/database');

class ResultModel {
    static async addResult(resultData) {
        const {
            admission_number, subject, marks, total_marks, grade, exam_type, exam_date
        } = resultData;

        const [result] = await db.query(
            `INSERT INTO results (
                admission_number, subject, marks, total_marks,
                grade, exam_type, exam_date, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [admission_number, subject, marks, total_marks, grade, exam_type, exam_date]
        );
        return result;
    }

    static async getResultsByStudent(admissionNumber) {
        const [rows] = await db.query(
            'SELECT * FROM results WHERE admission_number = ? ORDER BY exam_date DESC',
            [admissionNumber]
        );
        return rows;
    }

    static async getResultSummary(admissionNumber) {
        const [rows] = await db.query(
            `SELECT
                AVG(marks) as average_marks,
                AVG(total_marks) as average_total,
                COUNT(*) as total_subjects,
                SUM(marks) as total_marks,
                SUM(total_marks) as total_max_marks
            FROM results
            WHERE admission_number = ?`,
            [admissionNumber]
        );
        return rows[0];
    }

    static async getPercentage(admissionNumber) {
        const summary = await this.getResultSummary(admissionNumber);
        if (!summary || summary.total_subjects === 0) return 0;
        return ((summary.total_marks / summary.total_max_marks) * 100).toFixed(2);
    }

    static async getGrade(percentage) {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B';
        if (percentage >= 60) return 'C';
        if (percentage >= 50) return 'D';
        return 'F';
    }

    static async deleteResult(resultId) {
        const [result] = await db.query(
            'DELETE FROM results WHERE id = ?',
            [resultId]
        );
        return result;
    }

    static async updateResult(resultId, resultData) {
        const { marks, total_marks, grade, exam_type, exam_date } = resultData;

        const [result] = await db.query(
            `UPDATE results SET
                marks = ?, total_marks = ?, grade = ?,
                exam_type = ?, exam_date = ?, updated_at = NOW()
            WHERE id = ?`,
            [marks, total_marks, grade, exam_type, exam_date, resultId]
        );
        return result;
    }

    static async getResultsByExamType(admissionNumber, examType) {
        const [rows] = await db.query(
            'SELECT * FROM results WHERE admission_number = ? AND exam_type = ? ORDER BY exam_date DESC',
            [admissionNumber, examType]
        );
        return rows;
    }

    static async getExamTypes(admissionNumber) {
        const [rows] = await db.query(
            'SELECT DISTINCT exam_type FROM results WHERE admission_number = ? ORDER BY exam_type',
            [admissionNumber]
        );
        return rows.map(row => row.exam_type);
    }

    static async getAllExamTypes() {
        const [rows] = await db.query(
            'SELECT DISTINCT exam_type FROM results ORDER BY exam_type'
        );
        return rows.map(row => row.exam_type);
    }

    static async getSubjectPerformance(admissionNumber) {
        const [rows] = await db.query(
            `SELECT 
                subject,
                COUNT(*) as exam_count,
                AVG(marks) as avg_marks,
                AVG(total_marks) as avg_total_marks,
                AVG(marks/total_marks * 100) as avg_percentage,
                MAX(marks) as max_marks,
                MIN(marks) as min_marks
            FROM results
            WHERE admission_number = ?
            GROUP BY subject
            ORDER BY subject`,
            [admissionNumber]
        );
        return rows;
    }
}

module.exports = ResultModel;