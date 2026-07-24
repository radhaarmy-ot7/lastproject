const TeacherModel = require('../models/teacherModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/loggerService');

exports.teacherLogin = async (req, res) => {
    try {
        const { teacher_id, password } = req.body;

        console.log('Login attempt:', { teacher_id, password });

        if (!teacher_id || !password) {
            return responseHandler.badRequest(res, 'Teacher ID and password are required');
        }

        const teacher = await TeacherModel.findByTeacherIdWithPassword(teacher_id);

        if (!teacher) {
            console.log('Teacher not found:', teacher_id);
            return responseHandler.notFound(res, 'No Result Found');
        }

        if (!teacher.password) {
            return responseHandler.unauthorized(res, 'Account credentials are not configured yet.');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, teacher.password);

        console.log('Password valid:', isPasswordValid);

        if (!isPasswordValid) {
            return responseHandler.unauthorized(res, 'Invalid credentials');
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: teacher.teacher_id,
                role: 'teacher',
                name: teacher.full_name,
                email: teacher.email
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        // Log activity if available
        try {
            await TeacherModel.logActivity(teacher_id, 'LOGIN', {
                timestamp: new Date().toISOString(),
                ip: req.ip
            });
        } catch (activityError) {
            logger.warn(`Activity logging skipped for teacher login: ${activityError.message}`);
        }

        responseHandler.success(res, {
            token,
            user: {
                teacher_id: teacher.teacher_id,
                full_name: teacher.full_name,
                email: teacher.email,
                phone: teacher.phone,
                role: 'teacher'
            }
        }, 'Login successful');
    } catch (error) {
        console.error('Login error:', error);
        logger.logError(error, req);
        responseHandler.serverError(res, 'Login failed');
    }
};