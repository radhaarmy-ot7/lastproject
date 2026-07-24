const TeacherModel = require('../models/teacherModel');
const bcrypt = require('bcrypt');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/loggerService');

exports.getTeacherProfile = async (req, res) => {
    try {
        const { teacher_id } = req.params;

        const profile = await TeacherModel.getProfile(teacher_id);

        if (!profile) {
            return responseHandler.notFound(res, 'Teacher not found');
        }

        responseHandler.success(res, profile, 'Teacher profile fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch teacher profile');
    }
};

exports.updateTeacherProfile = async (req, res) => {
    try {
        const { teacher_id } = req.params;
        const { full_name, email, phone, joining_date } = req.body;

        const teacher = await TeacherModel.findByTeacherId(teacher_id);

        if (!teacher) {
            return responseHandler.notFound(res, 'Teacher not found');
        }

        // Update profile
        await TeacherModel.updateProfile(teacher_id, {
            full_name,
            email,
            phone,
            joining_date
        });

        // Log activity
        await TeacherModel.logActivity(teacher_id, 'PROFILE_UPDATE', {
            updated_fields: Object.keys(req.body),
            timestamp: new Date().toISOString()
        });

        logger.logActivity({
            type: 'TEACHER_PROFILE_UPDATE',
            teacher_id: teacher_id,
            updated_fields: Object.keys(req.body)
        });

        responseHandler.success(res, null, 'Profile updated successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to update profile');
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { teacher_id } = req.params;
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return responseHandler.badRequest(res, 'Current and new password are required');
        }

        if (new_password.length < 6) {
            return responseHandler.badRequest(res, 'New password must be at least 6 characters');
        }

        const teacher = await TeacherModel.findByTeacherIdWithPassword(teacher_id);

        if (!teacher) {
            return responseHandler.notFound(res, 'Teacher not found');
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(current_password, teacher.password);

        if (!isPasswordValid) {
            return responseHandler.unauthorized(res, 'Current password is incorrect');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        await TeacherModel.updatePassword(teacher_id, hashedPassword);

        // Log activity
        await TeacherModel.logActivity(teacher_id, 'PASSWORD_CHANGE', {
            timestamp: new Date().toISOString()
        });

        logger.logActivity({
            type: 'TEACHER_PASSWORD_CHANGE',
            teacher_id: teacher_id
        });

        responseHandler.success(res, null, 'Password changed successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to change password');
    }
};

exports.getTeacherStats = async (req, res) => {
    try {
        const { teacher_id } = req.params;

        const db = require('../config/database');
        
        // Get total students
        const [studentCount] = await db.query(
            'SELECT COUNT(*) as total FROM students WHERE is_deleted = FALSE'
        );

        // Get today's attendance
        const today = new Date().toISOString().split('T')[0];
        const [attendanceCount] = await db.query(
            'SELECT COUNT(*) as present FROM attendance WHERE date = ? AND status = "present"',
            [today]
        );

        // Get recent activities
        const [recentActivities] = await db.query(
            `SELECT * FROM activity_logs 
            WHERE teacher_id = ? 
            ORDER BY created_at DESC 
            LIMIT 10`,
            [teacher_id]
        );

        // Get notices count
        const [noticeCount] = await db.query(
            'SELECT COUNT(*) as total FROM notices'
        );

        responseHandler.success(res, {
            total_students: studentCount[0].total || 0,
            today_attendance: attendanceCount[0].present || 0,
            total_notices: noticeCount[0].total || 0,
            recent_activities: recentActivities || [],
            attendance_percentage: await this.getTeacherAttendanceStats(teacher_id)
        }, 'Teacher stats fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch teacher stats');
    }
};

exports.getTeacherAttendanceStats = async (teacher_id) => {
    try {
        const db = require('../config/database');
        const [rows] = await db.query(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
            FROM attendance 
            WHERE teacher_id = ?`,
            [teacher_id]
        );
        if (rows[0].total === 0) return 0;
        return ((rows[0].present / rows[0].total) * 100).toFixed(2);
    } catch (error) {
        logger.error('Error getting teacher attendance stats:', error);
        return 0;
    }
};

exports.getTeacherActivityLogs = async (req, res) => {
    try {
        const { teacher_id } = req.params;
        const { limit = 20, offset = 0 } = req.query;

        const db = require('../config/database');
        const [logs] = await db.query(
            `SELECT * FROM activity_logs 
            WHERE teacher_id = ? 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?`,
            [teacher_id, parseInt(limit), parseInt(offset)]
        );

        const [total] = await db.query(
            'SELECT COUNT(*) as total FROM activity_logs WHERE teacher_id = ?',
            [teacher_id]
        );

        responseHandler.success(res, {
            logs: logs || [],
            total: total[0].total || 0,
            limit: parseInt(limit),
            offset: parseInt(offset)
        }, 'Activity logs fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch activity logs');
    }
};