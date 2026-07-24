const StudentModel = require('../models/studentModel');
const AttendanceModel = require('../models/attendanceModel');
const ResultModel = require('../models/resultModel');
const NoticeModel = require('../models/noticeModel');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/loggerService');

exports.getStudentDashboard = async (req, res) => {
    try {
        const { admission_number } = req.params;

        const student = await StudentModel.findByAdmissionNumber(admission_number);

        if (!student) {
            return responseHandler.notFound(res, 'Student not found');
        }

        const attendance = await AttendanceModel.getAttendanceSummary(admission_number);
        const results = await ResultModel.getResultsByStudent(admission_number);
        const percentage = await ResultModel.getPercentage(admission_number);
        const attendancePercentage = await AttendanceModel.getAttendancePercentage(admission_number);
        const notices = await NoticeModel.getRecentNotices(5);

        // Get monthly attendance
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const monthlyAttendance = await AttendanceModel.getMonthlyAttendance(
            admission_number,
            currentMonth,
            currentYear
        );

        // Calculate attendance chart data
        const attendanceChartData = [];
        for (let day = 1; day <= 31; day++) {
            const date = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const record = monthlyAttendance.find(a => {
                const d = new Date(a.date);
                return d.getDate() === day;
            });
            attendanceChartData.push({
                day,
                status: record ? record.status : 'absent'
            });
        }

        // Get result summary by subject
        const subjectResults = {};
        results.forEach(result => {
            if (!subjectResults[result.subject]) {
                subjectResults[result.subject] = [];
            }
            subjectResults[result.subject].push({
                marks: result.marks,
                total_marks: result.total_marks,
                exam_type: result.exam_type,
                exam_date: result.exam_date
            });
        });

        responseHandler.success(res, {
            student: {
                admission_number: student.admission_number,
                full_name: student.full_name,
                class: student.class,
                father_name: student.father_name,
                mother_name: student.mother_name,
                date_of_birth: student.date_of_birth,
                address: student.address,
                phone_number: student.phone_number,
                father_occupation: student.father_occupation,
                mother_occupation: student.mother_occupation,
                joining_date: student.joining_date
            },
            attendance: attendance || { total_days: 0, present_days: 0, absent_days: 0 },
            attendance_percentage: attendancePercentage || 0,
            attendance_chart: attendanceChartData,
            results: results || [],
            percentage: percentage || 0,
            subject_results: subjectResults,
            recent_notices: notices || []
        }, 'Dashboard data fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch dashboard data');
    }
};

exports.getAttendanceChart = async (req, res) => {
    try {
        const { admission_number } = req.params;
        const { month, year } = req.query;

        const m = parseInt(month) || new Date().getMonth() + 1;
        const y = parseInt(year) || new Date().getFullYear();

        const attendance = await AttendanceModel.getMonthlyAttendance(
            admission_number,
            m,
            y
        );

        const chartData = [];
        const daysInMonth = new Date(y, m, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const record = attendance.find(a => {
                const d = new Date(a.date);
                return d.getDate() === day;
            });
            chartData.push({
                date,
                day,
                status: record ? record.status : 'absent',
                dayOfWeek: new Date(y, m - 1, day).toLocaleDateString('en-US', { weekday: 'short' })
            });
        }

        responseHandler.success(res, {
            month: m,
            year: y,
            data: chartData,
            summary: {
                present: chartData.filter(d => d.status === 'present').length,
                absent: chartData.filter(d => d.status === 'absent').length,
                late: chartData.filter(d => d.status === 'late').length
            }
        }, 'Attendance chart data fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch attendance chart data');
    }
};

exports.getResultChart = async (req, res) => {
    try {
        const { admission_number } = req.params;

        const results = await ResultModel.getResultsByStudent(admission_number);

        const chartData = {};
        results.forEach(result => {
            if (!chartData[result.exam_type]) {
                chartData[result.exam_type] = [];
            }
            chartData[result.exam_type].push({
                subject: result.subject,
                marks: result.marks,
                total_marks: result.total_marks,
                percentage: (result.marks / result.total_marks) * 100,
                grade: result.grade
            });
        });

        responseHandler.success(res, {
            chartData,
            summary: {
                total_subjects: results.length,
                average_percentage: await ResultModel.getPercentage(admission_number)
            }
        }, 'Result chart data fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch result chart data');
    }
};