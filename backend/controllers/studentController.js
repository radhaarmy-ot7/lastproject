const StudentModel = require('../models/studentModel');
const bcrypt = require('bcrypt');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/loggerService');

exports.getAllStudents = async (req, res) => {
    try {
        const students = await StudentModel.findAll();
        responseHandler.success(res, students, 'Students fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch students');
    }
};

exports.addStudent = async (req, res) => {
    try {
        const studentData = req.body;

        // Generate admission number
        const admissionNumber = await StudentModel.getNextAdmissionNumber();
        studentData.admission_number = admissionNumber;

        // Hash password (default password: admission_number)
        const hashedPassword = await bcrypt.hash(admissionNumber.toString(), 10);
        studentData.password = hashedPassword;

        const result = await StudentModel.create(studentData);

        // Log activity
        const teacherId = req.user?.id;
        if (teacherId) {
            const TeacherModel = require('../models/teacherModel');
            await TeacherModel.logActivity(teacherId, 'STUDENT_ADD', {
                admission_number: admissionNumber,
                full_name: studentData.full_name,
                class: studentData.class
            });
        }

        responseHandler.created(res, {
            admission_number: admissionNumber,
            ...studentData
        }, 'Student added successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to add student');
    }
};

exports.searchStudent = async (req, res) => {
    try {
        const { admission_number } = req.params;

        if (!admission_number) {
            return responseHandler.badRequest(res, 'Admission number is required');
        }

        const student = await StudentModel.findByAdmissionNumber(admission_number);

        if (!student) {
            return responseHandler.notFound(res, 'Student not found');
        }

        responseHandler.success(res, student, 'Student found successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to search student');
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const { admission_number } = req.params;

        const student = await StudentModel.findByAdmissionNumber(admission_number);

        if (!student) {
            return responseHandler.notFound(res, 'Student not found');
        }

        const result = await StudentModel.update(admission_number, req.body);

        // Log activity
        const teacherId = req.user?.id;
        if (teacherId) {
            const TeacherModel = require('../models/teacherModel');
            await TeacherModel.logActivity(teacherId, 'STUDENT_UPDATE', {
                admission_number: admission_number,
                updated_fields: Object.keys(req.body)
            });
        }

        responseHandler.success(res, null, 'Student updated successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to update student');
    }
};

exports.getStudentStats = async (req, res) => {
    try {
        const total = await StudentModel.getTotalCount();
        const active = await StudentModel.getActiveCount();
        const deleted = await StudentModel.getDeletedCount();

        responseHandler.success(res, {
            total,
            active,
            deleted
        }, 'Student statistics fetched successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to fetch student statistics');
    }
};

exports.bulkAddStudents = async (req, res) => {
    try {
        const students = req.body.students;

        if (!students || !Array.isArray(students) || students.length === 0) {
            return responseHandler.badRequest(res, 'Students array is required');
        }

        const results = [];
        for (const studentData of students) {
            const admissionNumber = await StudentModel.getNextAdmissionNumber();
            studentData.admission_number = admissionNumber;
            const hashedPassword = await bcrypt.hash(admissionNumber.toString(), 10);
            studentData.password = hashedPassword;
            await StudentModel.create(studentData);
            results.push(admissionNumber);
        }

        responseHandler.success(res, {
            added: results.length,
            admission_numbers: results
        }, 'Students added successfully');
    } catch (error) {
        logger.logError(error, req);
        responseHandler.serverError(res, 'Failed to add students');
    }
};