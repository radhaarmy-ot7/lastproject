const AttendanceModel = require('../models/attendanceModel');
const StudentModel = require('../models/studentModel');
const TeacherModel = require('../models/teacherModel');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/loggerService');

exports.markAttendance = async (req, res) => {
    try {
        const { admission_number, date, status } = req.body;

        if (!admission_number || !date || !status) {
            return responseHandler.badRequest(res, 'Admission number, date, and status are required');
        }

        const student = await StudentModel.findByAdmissionNumber(admission_number);
        if (!student) {
            return responseHandler.notFound(res, 'Student not found');
        }

        const result = await AttendanceModel.markAttendance(admission_number, date, status);

        // Log activity
        const teacherId = req.user?.id;
        if (teacherId) {
            await TeacherModel.logActivity(teacherId, 'ATTENDANCE_MARK', {
                admission_number,
                date,
                status,
                student_name: student.full_name
            });
        }

        logger.logActivity({
            type: 'ATTENDANCE_MARKED',
            admission_number,
            date,
            status
        });

        responseHandler.success(res, null, 'Attendance marked successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to mark attendance');
    }
};

exports.getStudentAttendance = async (req, res) => {
    try {
        const { admission_number } = req.params;

        const attendance = await AttendanceModel.getAttendanceByStudent(admission_number);

        responseHandler.success(res, attendance, 'Attendance fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch attendance');
    }
};

exports.getAttendanceSummary = async (req, res) => {
    try {
        const { admission_number } = req.params;

        const summary = await AttendanceModel.getAttendanceSummary(admission_number);
        const percentage = await AttendanceModel.getAttendancePercentage(admission_number);

        responseHandler.success(res, {
            ...summary,
            percentage: percentage || 0
        }, 'Attendance summary fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch attendance summary');
    }
};

exports.getMonthlyAttendance = async (req, res) => {
    try {
        const { admission_number } = req.params;
        const { month, year } = req.query;

        const m = parseInt(month) || new Date().getMonth() + 1;
        const y = parseInt(year) || new Date().getFullYear();

        const attendance = await AttendanceModel.getMonthlyAttendance(admission_number, m, y);

        responseHandler.success(res, {
            month: m,
            year: y,
            data: attendance,
            summary: {
                present: attendance.filter(a => a.status === 'present').length,
                absent: attendance.filter(a => a.status === 'absent').length,
                late: attendance.filter(a => a.status === 'late').length
            }
        }, 'Monthly attendance fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch monthly attendance');
    }
};

exports.getAttendanceReport = async (req, res) => {
    try {
        const { start_date, end_date, class: classFilter } = req.query;

        if (!start_date || !end_date) {
            return responseHandler.badRequest(res, 'Start date and end date are required');
        }

        const db = require('../config/database');
        
        let query = `
            SELECT s.admission_number, s.full_name, s.class,
                   COUNT(a.id) as total_days,
                   SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_days,
                   SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_days,
                   SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_days
            FROM students s
            LEFT JOIN attendance a ON s.admission_number = a.admission_number
            WHERE a.date BETWEEN ? AND ?
        `;

        const params = [start_date, end_date];

        if (classFilter) {
            query += ' AND s.class = ?';
            params.push(classFilter);
        }

        query += ' GROUP BY s.admission_number ORDER BY s.class, s.full_name';

        const [rows] = await db.query(query, params);

        // Calculate percentages
        const report = rows.map(row => ({
            ...row,
            attendance_percentage: row.total_days > 0 
                ? ((row.present_days / row.total_days) * 100).toFixed(2)
                : 0
        }));

        responseHandler.success(res, {
            start_date,
            end_date,
            class: classFilter || 'All',
            total_students: report.length,
            data: report
        }, 'Attendance report generated successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to generate attendance report');
    }
};

exports.bulkMarkAttendance = async (req, res) => {
    try {
        const { attendance_data } = req.body;

        if (!attendance_data || !Array.isArray(attendance_data) || attendance_data.length === 0) {
            return responseHandler.badRequest(res, 'Attendance data array is required');
        }

        const results = [];
        for (const data of attendance_data) {
            const { admission_number, date, status } = data;
            if (admission_number && date && status) {
                await AttendanceModel.markAttendance(admission_number, date, status);
                results.push({ admission_number, status });
            }
        }

        const teacherId = req.user?.id;
        if (teacherId) {
            await TeacherModel.logActivity(teacherId, 'BULK_ATTENDANCE_MARK', {
                count: results.length,
                date: new Date().toISOString().split('T')[0]
            });
        }

        responseHandler.success(res, {
            total: results.length,
            data: results
        }, 'Bulk attendance marked successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to mark bulk attendance');
    }
};