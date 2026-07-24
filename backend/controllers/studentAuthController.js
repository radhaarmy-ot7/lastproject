const StudentModel = require('../models/studentModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/loggerService');

exports.studentLogin = async (req, res) => {
    try {
        const { name, admission_number } = req.body;

        if (!name || !admission_number) {
            return responseHandler.badRequest(res, 'Student name and admission number are required');
        }

        const student = await StudentModel.findByAdmissionNumber(admission_number);

        if (!student) {
            return responseHandler.notFound(res, 'No Result Found');
        }

        if (!student.full_name) {
            return responseHandler.unauthorized(res, 'Student profile is incomplete.');
        }

        // Verify student name matches
        if (student.full_name.toLowerCase() !== name.toLowerCase()) {
            return responseHandler.unauthorized(res, 'Invalid credentials');
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: student.admission_number,
                role: 'student',
                name: student.full_name,
                class: student.class
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        logger.logActivity({
            type: 'STUDENT_LOGIN',
            admission_number: student.admission_number,
            name: student.full_name
        });

        responseHandler.success(res, {
            token,
            user: {
                admission_number: student.admission_number,
                full_name: student.full_name,
                class: student.class,
                role: 'student'
            }
        }, 'Login successful');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Login failed');
    }
};

exports.studentLogout = async (req, res) => {
    try {
        const admission_number = req.user?.id;
        if (admission_number) {
            logger.logActivity({
                type: 'STUDENT_LOGOUT',
                admission_number: admission_number
            });
        }
        responseHandler.success(res, null, 'Logout successful');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Logout failed');
    }
};

exports.validateToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return responseHandler.unauthorized(res, 'No token provided');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const student = await StudentModel.findByAdmissionNumber(decoded.id);

        if (!student) {
            return responseHandler.notFound(res, 'Student not found');
        }

        responseHandler.success(res, {
            valid: true,
            user: {
                admission_number: student.admission_number,
                full_name: student.full_name,
                class: student.class,
                role: 'student'
            }
        }, 'Token is valid');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.unauthorized(res, 'Invalid token');
    }
};

exports.changeStudentPassword = async (req, res) => {
    try {
        const { admission_number } = req.params;
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return responseHandler.badRequest(res, 'Current and new password are required');
        }

        const student = await StudentModel.findByAdmissionNumberWithDeleted(admission_number);

        if (!student) {
            return responseHandler.notFound(res, 'Student not found');
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(current_password, student.password);

        if (!isPasswordValid) {
            return responseHandler.unauthorized(res, 'Current password is incorrect');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        const db = require('../config/database');
        await db.query(
            'UPDATE students SET password = ?, updated_at = NOW() WHERE admission_number = ?',
            [hashedPassword, admission_number]
        );

        logger.logActivity({
            type: 'STUDENT_PASSWORD_CHANGE',
            admission_number: admission_number
        });

        responseHandler.success(res, null, 'Password changed successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to change password');
    }
};

exports.resetStudentPassword = async (req, res) => {
    try {
        const { admission_number } = req.params;

        const student = await StudentModel.findByAdmissionNumberWithDeleted(admission_number);

        if (!student) {
            return responseHandler.notFound(res, 'Student not found');
        }

        // Reset password to admission_number
        const hashedPassword = await bcrypt.hash(admission_number.toString(), 10);

        const db = require('../config/database');
        await db.query(
            'UPDATE students SET password = ?, updated_at = NOW() WHERE admission_number = ?',
            [hashedPassword, admission_number]
        );

        const teacherId = req.user?.id;
        if (teacherId) {
            const TeacherModel = require('../models/teacherModel');
            await TeacherModel.logActivity(teacherId, 'STUDENT_PASSWORD_RESET', {
                admission_number: admission_number,
                full_name: student.full_name
            });
        }

        responseHandler.success(res, {
            new_password: admission_number.toString()
        }, 'Password reset successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to reset password');
    }
};