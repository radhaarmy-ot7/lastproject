const StudentModel = require('../models/studentModel');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/loggerService');

exports.getStudentProfile = async (req, res) => {
    try {
        const { admission_number } = req.params;

        const student = await StudentModel.findByAdmissionNumber(admission_number);

        if (!student) {
            return responseHandler.notFound(res, 'Student not found');
        }

        // Remove sensitive data
        delete student.password;

        responseHandler.success(res, student, 'Student profile fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch student profile');
    }
};

exports.getStudentProfileWithDetails = async (req, res) => {
    try {
        const { admission_number } = req.params;

        const student = await StudentModel.findByAdmissionNumber(admission_number);

        if (!student) {
            return responseHandler.notFound(res, 'Student not found');
        }

        const AttendanceModel = require('../models/attendanceModel');
        const ResultModel = require('../models/resultModel');

        const attendance = await AttendanceModel.getAttendanceSummary(admission_number);
        const results = await ResultModel.getResultsByStudent(admission_number);
        const percentage = await ResultModel.getPercentage(admission_number);
        const attendancePercentage = await AttendanceModel.getAttendancePercentage(admission_number);

        // Remove sensitive data
        delete student.password;

        responseHandler.success(res, {
            profile: student,
            attendance_summary: attendance || { total_days: 0, present_days: 0, absent_days: 0 },
            attendance_percentage: attendancePercentage || 0,
            results: results || [],
            overall_percentage: percentage || 0,
            total_subjects: results.length
        }, 'Student profile with details fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch student profile details');
    }
};

exports.getStudentClassmates = async (req, res) => {
    try {
        const { admission_number } = req.params;

        const student = await StudentModel.findByAdmissionNumber(admission_number);

        if (!student) {
            return responseHandler.notFound(res, 'Student not found');
        }

        const db = require('../config/database');
        const [rows] = await db.query(
            `SELECT admission_number, full_name, father_name, mother_name, phone_number
            FROM students
            WHERE class = ? AND admission_number != ? AND is_deleted = FALSE
            ORDER BY full_name`,
            [student.class, admission_number]
        );

        responseHandler.success(res, {
            class: student.class,
            total_students: rows.length + 1,
            classmates: rows
        }, 'Classmates fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch classmates');
    }
};

exports.updateStudentProfile = async (req, res) => {
    try {
        const { admission_number } = req.params;
        const { 
            full_name, father_name, mother_name, date_of_birth, 
            class: studentClass, address, phone_number, 
            father_occupation, mother_occupation, joining_date 
        } = req.body;

        const student = await StudentModel.findByAdmissionNumber(admission_number);

        if (!student) {
            return responseHandler.notFound(res, 'Student not found');
        }

        const result = await StudentModel.update(admission_number, {
            full_name,
            father_name,
            mother_name,
            date_of_birth,
            class: studentClass,
            address,
            phone_number,
            father_occupation,
            mother_occupation,
            joining_date
        });

        const teacherId = req.user?.id;
        if (teacherId) {
            const TeacherModel = require('../models/teacherModel');
            await TeacherModel.logActivity(teacherId, 'STUDENT_PROFILE_UPDATE', {
                admission_number: admission_number,
                full_name: student.full_name
            });
        }

        responseHandler.success(res, null, 'Student profile updated successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to update student profile');
    }
};