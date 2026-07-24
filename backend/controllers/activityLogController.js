const ActivityLogModel = require('../models/activityLogModel');
const TeacherModel = require('../models/teacherModel');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/loggerService');

exports.getAllLogs = async (req, res) => {
    try {
        const logs = await ActivityLogModel.findAll();

        responseHandler.success(res, logs, 'Activity logs fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch activity logs');
    }
};

exports.getTeacherLogs = async (req, res) => {
    try {
        const { teacher_id } = req.params;

        const logs = await ActivityLogModel.findByTeacher(teacher_id);

        responseHandler.success(res, logs, 'Teacher logs fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch teacher logs');
    }
};

exports.getRecentLogs = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const logs = await ActivityLogModel.getRecentActivities(limit);

        responseHandler.success(res, logs, 'Recent logs fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch recent logs');
    }
};

exports.getActivitySummary = async (req, res) => {
    try {
        const summary = await ActivityLogModel.getActivitySummary();

        responseHandler.success(res, summary, 'Activity summary fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch activity summary');
    }
};

exports.deleteOldLogs = async (req, res) => {
    try {
        const { days } = req.query;
        const daysToKeep = parseInt(days) || 30;

        const result = await ActivityLogModel.deleteOldLogs(daysToKeep);

        const teacherId = req.user?.id;
        if (teacherId) {
            await TeacherModel.logActivity(teacherId, 'LOGS_CLEANUP', {
                days_kept: daysToKeep,
                deleted_count: result.affectedRows
            });
        }

        responseHandler.success(res, {
            deleted_count: result.affectedRows
        }, `Old logs deleted successfully (kept ${daysToKeep} days)`);
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to delete old logs');
    }
};

exports.getLogsByDateRange = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return responseHandler.badRequest(res, 'Start date and end date are required');
        }

        const db = require('../config/database');
        const [logs] = await db.query(
            `SELECT al.*, t.full_name as teacher_name
            FROM activity_logs al
            LEFT JOIN teachers t ON al.teacher_id = t.teacher_id
            WHERE DATE(al.created_at) BETWEEN ? AND ?
            ORDER BY al.created_at DESC`,
            [start_date, end_date]
        );

        responseHandler.success(res, {
            start_date,
            end_date,
            total: logs.length,
            data: logs
        }, 'Logs fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch logs by date range');
    }
};