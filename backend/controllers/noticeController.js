const NoticeModel = require('../models/noticeModel');
const TeacherModel = require('../models/teacherModel');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/loggerService');

exports.createNotice = async (req, res) => {
    try {
        const noticeData = req.body;

        if (!noticeData.title || !noticeData.content) {
            return responseHandler.badRequest(res, 'Title and content are required');
        }

        // Set teacher_id from authenticated user
        noticeData.teacher_id = req.user?.id;

        const result = await NoticeModel.create(noticeData);

        // Log activity
        if (noticeData.teacher_id) {
            await TeacherModel.logActivity(noticeData.teacher_id, 'NOTICE_CREATE', {
                notice_id: result.insertId,
                title: noticeData.title
            });
        }

        logger.logActivity({
            type: 'NOTICE_CREATED',
            teacher_id: noticeData.teacher_id,
            title: noticeData.title
        });

        responseHandler.created(res, {
            id: result.insertId,
            ...noticeData
        }, 'Notice created successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to create notice');
    }
};

exports.getAllNotices = async (req, res) => {
    try {
        const notices = await NoticeModel.findAll();

        responseHandler.success(res, notices, 'Notices fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch notices');
    }
};

exports.getNoticeById = async (req, res) => {
    try {
        const { id } = req.params;

        const notice = await NoticeModel.findById(id);

        if (!notice) {
            return responseHandler.notFound(res, 'Notice not found');
        }

        responseHandler.success(res, notice, 'Notice fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch notice');
    }
};

exports.updateNotice = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, date } = req.body;

        const notice = await NoticeModel.findById(id);

        if (!notice) {
            return responseHandler.notFound(res, 'Notice not found');
        }

        await NoticeModel.update(id, { title, content, date });

        // Log activity
        const teacherId = req.user?.id;
        if (teacherId) {
            await TeacherModel.logActivity(teacherId, 'NOTICE_UPDATE', {
                notice_id: id,
                title
            });
        }

        responseHandler.success(res, null, 'Notice updated successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to update notice');
    }
};

exports.deleteNotice = async (req, res) => {
    try {
        const { id } = req.params;

        const notice = await NoticeModel.findById(id);

        if (!notice) {
            return responseHandler.notFound(res, 'Notice not found');
        }

        await NoticeModel.delete(id);

        // Log activity
        const teacherId = req.user?.id;
        if (teacherId) {
            await TeacherModel.logActivity(teacherId, 'NOTICE_DELETE', {
                notice_id: id,
                title: notice.title
            });
        }

        responseHandler.success(res, null, 'Notice deleted successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to delete notice');
    }
};

exports.getRecentNotices = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const notices = await NoticeModel.getRecentNotices(limit);

        responseHandler.success(res, notices, 'Recent notices fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch recent notices');
    }
};

exports.searchNotices = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return responseHandler.badRequest(res, 'Search query is required');
        }

        const db = require('../config/database');
        const [notices] = await db.query(
            `SELECT n.*, t.full_name as teacher_name
            FROM notices n
            LEFT JOIN teachers t ON n.teacher_id = t.teacher_id
            WHERE n.title LIKE ? OR n.content LIKE ?
            ORDER BY n.date DESC`,
            [`%${query}%`, `%${query}%`]
        );

        responseHandler.success(res, notices, 'Notices found successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to search notices');
    }
};