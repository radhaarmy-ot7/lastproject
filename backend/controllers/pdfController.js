const PDFDocument = require('pdfkit');
const StudentModel = require('../models/studentModel');
const AttendanceModel = require('../models/attendanceModel');
const ResultModel = require('../models/resultModel');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/loggerService');

exports.generateStudentPDF = async (req, res) => {
    try {
        const { admission_number } = req.params;

        const student = await StudentModel.findByAdmissionNumber(admission_number);

        if (!student) {
            return responseHandler.notFound(res, 'Student not found');
        }

        const attendance = await AttendanceModel.getAttendanceSummary(admission_number);
        const results = await ResultModel.getResultsByStudent(admission_number);
        const percentage = await ResultModel.getPercentage(admission_number);
        const grade = await ResultModel.getGrade(percentage);
        const attendancePercentage = await AttendanceModel.getAttendancePercentage(admission_number);

        // Create PDF
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });
        const filename = `student_${admission_number}_report.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Pipe PDF to response
        doc.pipe(res);

        // Header with border
        doc.rect(30, 30, 535, 60).stroke();
        doc.fontSize(20).text('KV School Management System', { align: 'center' });
        doc.fontSize(14).text('Student Report Card', { align: 'center' });
        doc.moveDown();

        // Student Information Section
        doc.fontSize(14).text('Student Information:', { underline: true });
        doc.fontSize(11);
        const infoX = 50;
        let infoY = doc.y + 10;

        const infoData = [
            ['Admission Number:', student.admission_number],
            ['Full Name:', student.full_name],
            ['Father\'s Name:', student.father_name || 'N/A'],
            ['Mother\'s Name:', student.mother_name || 'N/A'],
            ['Date of Birth:', student.date_of_birth || 'N/A'],
            ['Class:', student.class || 'N/A'],
            ['Address:', student.address || 'N/A'],
            ['Phone Number:', student.phone_number || 'N/A'],
            ['Father\'s Occupation:', student.father_occupation || 'N/A'],
            ['Mother\'s Occupation:', student.mother_occupation || 'N/A'],
            ['Joining Date:', student.joining_date || 'N/A']
        ];

        infoData.forEach(([label, value]) => {
            doc.text(`${label}`, infoX, infoY, { continued: true });
            doc.text(` ${value}`, { align: 'right' });
            infoY += 18;
        });

        doc.moveDown(2);

        // Attendance Summary
        doc.fontSize(14).text('Attendance Summary:', { underline: true });
        doc.fontSize(11);
        doc.text(`Total Days: ${attendance?.total_days || 0}`, 50);
        doc.text(`Present Days: ${attendance?.present_days || 0}`, 200);
        doc.text(`Absent Days: ${attendance?.absent_days || 0}`, 350);
        doc.text(`Attendance Percentage: ${attendancePercentage || 0}%`, 50);
        doc.moveDown();

        // Results Table
        doc.fontSize(14).text('Results:', { underline: true });
        doc.fontSize(11);

        if (results && results.length > 0) {
            // Table headers
            const tableTop = doc.y + 10;
            doc.rect(50, tableTop, 495, 20).fill('#e2e8f0');
            doc.fillColor('#1e293b');
            doc.text('Subject', 60, tableTop + 5);
            doc.text('Marks', 180, tableTop + 5);
            doc.text('Total', 260, tableTop + 5);
            doc.text('Percentage', 340, tableTop + 5);
            doc.text('Grade', 440, tableTop + 5);
            doc.text('Exam Type', 60, tableTop + 25, { width: 100 });

            let rowY = tableTop + 40;
            results.forEach(result => {
                const percentage = (result.marks / result.total_marks) * 100;
                doc.rect(50, rowY - 5, 495, 25).stroke();
                doc.fillColor('#1e293b');
                doc.text(result.subject || 'N/A', 60, rowY);
                doc.text(result.marks || 0, 180, rowY);
                doc.text(result.total_marks || 0, 260, rowY);
                doc.text(percentage.toFixed(1) + '%', 340, rowY);
                doc.text(result.grade || 'N/A', 440, rowY);
                rowY += 30;
            });

            doc.moveDown();
            doc.fontSize(12);
            doc.text(`Overall Percentage: ${percentage || 0}%`, 50);
            doc.text(`Overall Grade: ${grade || 'N/A'}`, 300);
        } else {
            doc.text('No results available', 50);
        }

        // Footer
        doc.moveDown(2);
        doc.fontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.text('This is a system generated report.', { align: 'center' });

        doc.end();

        logger.logActivity({
            type: 'PDF_GENERATED',
            admission_number: admission_number,
            student_name: student.full_name
        });

    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to generate PDF');
    }
};

exports.generateBulkPDF = async (req, res) => {
    try {
        const { class: classFilter, exam_type } = req.query;

        if (!classFilter) {
            return responseHandler.badRequest(res, 'Class is required');
        }

        const db = require('../config/database');
        let query = 'SELECT * FROM students WHERE class = ? AND is_deleted = FALSE ORDER BY full_name';
        const [students] = await db.query(query, [classFilter]);

        if (!students || students.length === 0) {
            return responseHandler.notFound(res, 'No students found in this class');
        }

        // Create PDF
        const doc = new PDFDocument({ size: 'A4', margins: { top: 50, bottom: 50, left: 50, right: 50 } });
        const filename = `class_${classFilter}_report.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        doc.pipe(res);

        // Header
        doc.fontSize(20).text('KV School Management System', { align: 'center' });
        doc.fontSize(16).text(`Class ${classFilter} Report Card`, { align: 'center' });
        doc.moveDown();

        // Table headers
        const tableTop = doc.y + 10;
        doc.rect(50, tableTop, 495, 20).fill('#e2e8f0');
        doc.fillColor('#1e293b');
        doc.fontSize(10);
        doc.text('Admission No.', 55, tableTop + 5);
        doc.text('Student Name', 120, tableTop + 5);
        doc.text('Father Name', 220, tableTop + 5);
        doc.text('Attendance %', 320, tableTop + 5);
        doc.text('Result %', 400, tableTop + 5);
        doc.text('Grade', 470, tableTop + 5);

        let rowY = tableTop + 30;
        for (const student of students) {
            const attendance = await AttendanceModel.getAttendancePercentage(student.admission_number);
            const percentage = await ResultModel.getPercentage(student.admission_number);
            const grade = await ResultModel.getGrade(percentage);

            doc.rect(50, rowY - 5, 495, 25).stroke();
            doc.fillColor('#1e293b');
            doc.text(student.admission_number.toString(), 55, rowY);
            doc.text(student.full_name || 'N/A', 120, rowY, { width: 90 });
            doc.text(student.father_name || 'N/A', 220, rowY, { width: 90 });
            doc.text(attendance + '%', 320, rowY);
            doc.text(percentage + '%', 400, rowY);
            doc.text(grade || 'N/A', 470, rowY);
            rowY += 30;

            if (rowY > 700) {
                doc.addPage();
                rowY = 50;
            }
        }

        doc.moveDown();
        doc.fontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.text('This is a system generated report.', { align: 'center' });

        doc.end();

        logger.logActivity({
            type: 'BULK_PDF_GENERATED',
            class: classFilter,
            total_students: students.length
        });

    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to generate bulk PDF');
    }
};