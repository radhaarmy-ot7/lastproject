const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate, authorizeTeacher } = require('../middleware/authMiddleware');

router.post('/', authenticate, authorizeTeacher, attendanceController.markAttendance);
router.get('/student/:admission_number', authenticate, attendanceController.getStudentAttendance);
router.get('/summary/:admission_number', authenticate, attendanceController.getAttendanceSummary);
router.get('/monthly/:admission_number', authenticate, attendanceController.getMonthlyAttendance);
router.get('/report', authenticate, authorizeTeacher, attendanceController.getAttendanceReport);
router.post('/bulk', authenticate, authorizeTeacher, attendanceController.bulkMarkAttendance);

module.exports = router;