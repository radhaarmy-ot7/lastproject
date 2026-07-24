const ResultModel = require('../models/resultModel');
const StudentModel = require('../models/studentModel');
const TeacherModel = require('../models/teacherModel');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/loggerService');

exports.addResult = async (req, res) => {
    try {
        const resultData = req.body;

        if (!resultData.admission_number || !resultData.subject) {
            return responseHandler.badRequest(res, 'Admission number and subject are required');
        }

        const student = await StudentModel.findByAdmissionNumber(resultData.admission_number);
        if (!student) {
            return responseHandler.notFound(res, 'Student not found');
        }

        const result = await ResultModel.addResult(resultData);

        const teacherId = req.user?.id;
        if (teacherId) {
            await TeacherModel.logActivity(teacherId, 'RESULT_ADD', {
                admission_number: resultData.admission_number,
                subject: resultData.subject,
                student_name: student.full_name
            });
        }

        logger.logActivity({
            type: 'RESULT_ADDED',
            admission_number: resultData.admission_number,
            subject: resultData.subject
        });

        responseHandler.created(res, result, 'Result added successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to add result');
    }
};

exports.getStudentResults = async (req, res) => {
    try {
        const { admission_number } = req.params;

        const results = await ResultModel.getResultsByStudent(admission_number);

        responseHandler.success(res, results, 'Results fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch results');
    }
};

exports.getResultSummary = async (req, res) => {
    try {
        const { admission_number } = req.params;

        const summary = await ResultModel.getResultSummary(admission_number);
        const percentage = await ResultModel.getPercentage(admission_number);
        const grade = await ResultModel.getGrade(percentage);

        responseHandler.success(res, {
            ...summary,
            percentage: percentage || 0,
            grade: grade || 'N/A'
        }, 'Result summary fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch result summary');
    }
};

exports.deleteResult = async (req, res) => {
    try {
        const { result_id } = req.params;

        const db = require('../config/database');
        const [result] = await db.query('SELECT * FROM results WHERE id = ?', [result_id]);

        if (!result || result.length === 0) {
            return responseHandler.notFound(res, 'Result not found');
        }

        await ResultModel.deleteResult(result_id);

        const teacherId = req.user?.id;
        if (teacherId) {
            await TeacherModel.logActivity(teacherId, 'RESULT_DELETE', {
                result_id,
                subject: result[0].subject
            });
        }

        responseHandler.success(res, null, 'Result deleted successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to delete result');
    }
};

exports.updateResult = async (req, res) => {
    try {
        const { result_id } = req.params;
        const { marks, total_marks, grade, exam_type, exam_date } = req.body;

        const db = require('../config/database');
        const [result] = await db.query('SELECT * FROM results WHERE id = ?', [result_id]);

        if (!result || result.length === 0) {
            return responseHandler.notFound(res, 'Result not found');
        }

        await db.query(
            `UPDATE results SET 
                marks = ?, total_marks = ?, grade = ?,
                exam_type = ?, exam_date = ?
            WHERE id = ?`,
            [marks, total_marks, grade, exam_type, exam_date, result_id]
        );

        const teacherId = req.user?.id;
        if (teacherId) {
            await TeacherModel.logActivity(teacherId, 'RESULT_UPDATE', {
                result_id,
                subject: result[0].subject
            });
        }

        responseHandler.success(res, null, 'Result updated successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to update result');
    }
};

exports.getResultsByExamType = async (req, res) => {
    try {
        const { admission_number } = req.params;
        const { exam_type } = req.query;

        if (!exam_type) {
            return responseHandler.badRequest(res, 'Exam type is required');
        }

        const db = require('../config/database');
        const [results] = await db.query(
            'SELECT * FROM results WHERE admission_number = ? AND exam_type = ? ORDER BY exam_date DESC',
            [admission_number, exam_type]
        );

        responseHandler.success(res, results, 'Results fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch results');
    }
};

exports.getExamTypes = async (req, res) => {
    try {
        const db = require('../config/database');
        const [rows] = await db.query(
            'SELECT DISTINCT exam_type FROM results ORDER BY exam_type'
        );

        responseHandler.success(res, rows.map(r => r.exam_type), 'Exam types fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch exam types');
    }
};