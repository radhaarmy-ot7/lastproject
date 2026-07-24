const StudentModel = require('../models/studentModel');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/loggerService');

exports.softDeleteStudent = async (req, res) => {
    try {
        const { admission_number } = req.params;

        const student = await StudentModel.findByAdmissionNumber(admission_number);

        if (!student) {
            return responseHandler.notFound(res, 'Student not found');
        }

        // Move to deleted_students table before soft delete
        const db = require('../config/database');
        await db.query(
            `INSERT INTO deleted_students (
                admission_number, full_name, father_name, mother_name,
                date_of_birth, class, address, phone_number,
                father_occupation, mother_occupation, joining_date, deleted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                student.admission_number, student.full_name, student.father_name,
                student.mother_name, student.date_of_birth, student.class,
                student.address, student.phone_number, student.father_occupation,
                student.mother_occupation, student.joining_date
            ]
        );

        const result = await StudentModel.softDelete(admission_number);

        // Log activity
        const teacherId = req.user?.id;
        if (teacherId) {
            const TeacherModel = require('../models/teacherModel');
            try {
                await TeacherModel.logActivity(teacherId, 'STUDENT_DELETE', {
                    admission_number: admission_number,
                    full_name: student.full_name
                });
            } catch (activityError) {
                logger.warn(`Activity logging skipped for student delete: ${activityError.message}`);
            }
        }

        responseHandler.success(res, null, 'Student deleted successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to delete student');
    }
};

exports.restoreStudent = async (req, res) => {
    try {
        const { admission_number } = req.params;

        const student = await StudentModel.findByAdmissionNumberWithDeleted(admission_number);

        if (!student) {
            return responseHandler.notFound(res, 'Student not found');
        }

        if (!student.is_deleted) {
            return responseHandler.badRequest(res, 'Student is not deleted');
        }

        const result = await StudentModel.restore(admission_number);

        // Remove from deleted_students
        const db = require('../config/database');
        await db.query(
            'DELETE FROM deleted_students WHERE admission_number = ?',
            [admission_number]
        );

        // Log activity
        const teacherId = req.user?.id;
        if (teacherId) {
            const TeacherModel = require('../models/teacherModel');
            try {
                await TeacherModel.logActivity(teacherId, 'STUDENT_RESTORE', {
                    admission_number: admission_number,
                    full_name: student.full_name
                });
            } catch (activityError) {
                logger.warn(`Activity logging skipped for student restore: ${activityError.message}`);
            }
        }

        responseHandler.success(res, null, 'Student restored successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to restore student');
    }
};

exports.getDeletedStudents = async (req, res) => {
    try {
        const students = await StudentModel.getDeletedStudents();
        responseHandler.success(res, students, 'Deleted students fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch deleted students');
    }
};

exports.permanentDeleteStudent = async (req, res) => {
    try {
        const { admission_number } = req.params;

        const student = await StudentModel.findByAdmissionNumberWithDeleted(admission_number);

        if (!student) {
            return responseHandler.notFound(res, 'Student not found');
        }

        // Permanent delete from database
        const db = require('../config/database');
        await db.query(
            'DELETE FROM students WHERE admission_number = ?',
            [admission_number]
        );

        // Remove from deleted_students if exists
        await db.query(
            'DELETE FROM deleted_students WHERE admission_number = ?',
            [admission_number]
        );

        // Log activity
        const teacherId = req.user?.id;
        if (teacherId) {
            const TeacherModel = require('../models/teacherModel');
            try {
                await TeacherModel.logActivity(teacherId, 'STUDENT_PERMANENT_DELETE', {
                    admission_number: admission_number,
                    full_name: student.full_name
                });
            } catch (activityError) {
                logger.warn(`Activity logging skipped for permanent student delete: ${activityError.message}`);
            }
        }

        responseHandler.success(res, null, 'Student permanently deleted');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to permanently delete student');
    }
};

exports.getDeletedStudentStats = async (req, res) => {
    try {
        const db = require('../config/database');
        const [rows] = await db.query(
            'SELECT COUNT(*) as count, DATE(deleted_at) as date FROM deleted_students GROUP BY DATE(deleted_at) ORDER BY date DESC LIMIT 30'
        );
        responseHandler.success(res, rows, 'Deleted student stats fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch deleted student stats');
    }
};