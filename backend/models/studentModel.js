const db = require('../config/database');

class StudentModel {
    static async findAll() {
        const [rows] = await db.query(
            'SELECT * FROM students WHERE is_deleted = FALSE ORDER BY admission_number DESC'
        );
        return rows;
    }

    static async findByAdmissionNumber(admissionNumber) {
        const [rows] = await db.query(
            'SELECT * FROM students WHERE admission_number = ? AND is_deleted = FALSE',
            [admissionNumber]
        );
        return rows[0];
    }

    static async findByAdmissionNumberWithDeleted(admissionNumber) {
        const [rows] = await db.query(
            'SELECT * FROM students WHERE admission_number = ?',
            [admissionNumber]
        );
        return rows[0];
    }

    static async create(studentData) {
        const {
            admission_number, full_name, father_name, mother_name,
            date_of_birth, class: studentClass, address, phone_number,
            father_occupation, mother_occupation, joining_date,
            password
        } = studentData;

        const [result] = await db.query(
            `INSERT INTO students (
                admission_number, full_name, father_name, mother_name,
                date_of_birth, class, address, phone_number,
                father_occupation, mother_occupation, joining_date,
                password, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                admission_number, full_name, father_name, mother_name,
                date_of_birth, studentClass, address, phone_number,
                father_occupation, mother_occupation, joining_date,
                password
            ]
        );
        return result;
    }

    static async update(admissionNumber, studentData) {
        const {
            full_name, father_name, mother_name,
            date_of_birth, class: studentClass, address, phone_number,
            father_occupation, mother_occupation, joining_date
        } = studentData;

        const [result] = await db.query(
            `UPDATE students SET
                full_name = ?, father_name = ?, mother_name = ?,
                date_of_birth = ?, class = ?, address = ?,
                phone_number = ?, father_occupation = ?,
                mother_occupation = ?, joining_date = ?,
                updated_at = NOW()
            WHERE admission_number = ? AND is_deleted = FALSE`,
            [
                full_name, father_name, mother_name,
                date_of_birth, studentClass, address, phone_number,
                father_occupation, mother_occupation, joining_date,
                admissionNumber
            ]
        );
        return result;
    }

    static async softDelete(admissionNumber) {
        const [result] = await db.query(
            `UPDATE students SET is_deleted = TRUE, deleted_at = NOW()
            WHERE admission_number = ? AND is_deleted = FALSE`,
            [admissionNumber]
        );
        return result;
    }

    static async restore(admissionNumber) {
        const [result] = await db.query(
            `UPDATE students SET is_deleted = FALSE, deleted_at = NULL
            WHERE admission_number = ? AND is_deleted = TRUE`,
            [admissionNumber]
        );
        return result;
    }

    static async getTotalCount() {
        const [rows] = await db.query(
            'SELECT COUNT(*) as total FROM students WHERE is_deleted = FALSE'
        );
        return rows[0].total;
    }

    static async getActiveCount() {
        const [rows] = await db.query(
            'SELECT COUNT(*) as active FROM students WHERE is_deleted = FALSE'
        );
        return rows[0].active;
    }

    static async getDeletedCount() {
        const [rows] = await db.query(
            'SELECT COUNT(*) as deleted FROM students WHERE is_deleted = TRUE'
        );
        return rows[0].deleted;
    }

    static async getNextAdmissionNumber() {
        const [rows] = await db.query(
            'SELECT MAX(admission_number) as max_admission FROM students'
        );
        const maxAdmission = rows[0].max_admission || 14999;
        return maxAdmission + 1;
    }

    static async getDeletedStudents() {
        const [rows] = await db.query(
            'SELECT * FROM students WHERE is_deleted = TRUE ORDER BY deleted_at DESC'
        );
        return rows;
    }
}

module.exports = StudentModel;