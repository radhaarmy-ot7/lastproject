const StudentModel = require('../models/studentModel');
const AttendanceModel = require('../models/attendanceModel');
const ResultModel = require('../models/resultModel');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/loggerService');

exports.getStudentReport = async (req, res) => {
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

        // Get grade
        const grade = await ResultModel.getGrade(percentage);

        responseHandler.success(res, {
            student: {
                admission_number: student.admission_number,
                full_name: student.full_name,
                father_name: student.father_name,
                mother_name: student.mother_name,
                date_of_birth: student.date_of_birth,
                class: student.class,
                address: student.address,
                phone_number: student.phone_number,
                father_occupation: student.father_occupation,
                mother_occupation: student.mother_occupation,
                joining_date: student.joining_date
            },
            attendance: attendance || { total_days: 0, present_days: 0, absent_days: 0 },
            attendance_percentage: attendancePercentage || 0,
            results: results || [],
            overall_percentage: percentage || 0,
            grade: grade || 'N/A',
            total_subjects: results.length
        }, 'Student report generated successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to generate student report');
    }
};

exports.getStudentReportCard = async (req, res) => {
    try {
        const { admission_number } = req.params;
        const { exam_type } = req.query;

        const student = await StudentModel.findByAdmissionNumber(admission_number);

        if (!student) {
            return responseHandler.notFound(res, 'Student not found');
        }

        let results = await ResultModel.getResultsByStudent(admission_number);
        
        if (exam_type) {
            results = results.filter(r => r.exam_type === exam_type);
        }

        const attendance = await AttendanceModel.getAttendanceSummary(admission_number);
        const percentage = await ResultModel.getPercentage(admission_number);
        const grade = await ResultModel.getGrade(percentage);

        // Group results by exam type
        const groupedResults = {};
        results.forEach(result => {
            if (!groupedResults[result.exam_type]) {
                groupedResults[result.exam_type] = [];
            }
            groupedResults[result.exam_type].push(result);
        });

        // Calculate subject wise performance
        const subjectPerformance = {};
        results.forEach(result => {
            if (!subjectPerformance[result.subject]) {
                subjectPerformance[result.subject] = {
                    total_marks: 0,
                    max_marks: 0,
                    count: 0,
                    exams: []
                };
            }
            subjectPerformance[result.subject].total_marks += result.marks;
            subjectPerformance[result.subject].max_marks += result.total_marks;
            subjectPerformance[result.subject].count += 1;
            subjectPerformance[result.subject].exams.push({
                exam_type: result.exam_type,
                marks: result.marks,
                total_marks: result.total_marks,
                grade: result.grade,
                exam_date: result.exam_date
            });
        });

        // Calculate subject averages
        Object.keys(subjectPerformance).forEach(subject => {
            const data = subjectPerformance[subject];
            data.average = (data.total_marks / data.max_marks) * 100;
            data.percentage = data.average.toFixed(2);
            data.grade = ResultModel.getGrade(data.average);
        });

        responseHandler.success(res, {
            student: {
                admission_number: student.admission_number,
                full_name: student.full_name,
                class: student.class,
                father_name: student.father_name,
                mother_name: student.mother_name
            },
            attendance: attendance || { total_days: 0, present_days: 0, absent_days: 0 },
            attendance_percentage: attendancePercentage || 0,
            results: groupedResults,
            subject_performance: subjectPerformance,
            overall_percentage: percentage || 0,
            overall_grade: grade || 'N/A',
            exam_types: Object.keys(groupedResults)
        }, 'Report card generated successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to generate report card');
    }
};

exports.getStudentProgressReport = async (req, res) => {
    try {
        const { admission_number } = req.params;

        const student = await StudentModel.findByAdmissionNumber(admission_number);

        if (!student) {
            return responseHandler.notFound(res, 'Student not found');
        }

        const results = await ResultModel.getResultsByStudent(admission_number);

        // Group by exam type and calculate trends
        const examTrends = {};
        results.forEach(result => {
            if (!examTrends[result.exam_type]) {
                examTrends[result.exam_type] = [];
            }
            examTrends[result.exam_type].push({
                subject: result.subject,
                marks: result.marks,
                total_marks: result.total_marks,
                percentage: (result.marks / result.total_marks) * 100,
                exam_date: result.exam_date
            });
        });

        // Calculate subject wise trends
        const subjectTrends = {};
        results.forEach(result => {
            if (!subjectTrends[result.subject]) {
                subjectTrends[result.subject] = [];
            }
            subjectTrends[result.subject].push({
                exam_type: result.exam_type,
                marks: result.marks,
                total_marks: result.total_marks,
                percentage: (result.marks / result.total_marks) * 100,
                exam_date: result.exam_date
            });
        });

        // Calculate overall progress
        const overallProgress = {
            total_exams: results.length,
            subjects: Object.keys(subjectTrends).length,
            average_percentage: await ResultModel.getPercentage(admission_number),
            best_subject: null,
            weakest_subject: null
        };

        // Find best and weakest subjects
        let bestScore = 0;
        let weakestScore = 100;
        Object.keys(subjectTrends).forEach(subject => {
            const subjectData = subjectTrends[subject];
            const avg = subjectData.reduce((sum, d) => sum + d.percentage, 0) / subjectData.length;
            if (avg > bestScore) {
                bestScore = avg;
                overallProgress.best_subject = subject;
            }
            if (avg < weakestScore) {
                weakestScore = avg;
                overallProgress.weakest_subject = subject;
            }
        });

        responseHandler.success(res, {
            student: {
                admission_number: student.admission_number,
                full_name: student.full_name,
                class: student.class
            },
            exam_trends: examTrends,
            subject_trends: subjectTrends,
            overall_progress: overallProgress,
            recommendations: this.generateRecommendations(overallProgress)
        }, 'Progress report generated successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to generate progress report');
    }
};

// Helper method for recommendations
exports.generateRecommendations = (progress) => {
    const recommendations = [];
    
    if (progress.average_percentage < 50) {
        recommendations.push('Overall performance needs improvement. Please focus on weak areas.');
    } else if (progress.average_percentage < 70) {
        recommendations.push('Good performance but has scope for improvement. Keep practicing.');
    } else {
        recommendations.push('Excellent performance! Keep up the good work.');
    }

    if (progress.weakest_subject) {
        recommendations.push(`Focus more on ${progress.weakest_subject} to improve overall performance.`);
    }

    if (progress.best_subject) {
        recommendations.push(`Continue excelling in ${progress.best_subject}.`);
    }

    return recommendations;
};