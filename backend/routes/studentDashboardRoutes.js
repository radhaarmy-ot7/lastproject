const express = require('express');
const router = express.Router();
const studentDashboardController = require('../controllers/studentDashboardController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/dashboard/:admission_number', authenticate, studentDashboardController.getStudentDashboard);
router.get('/attendance-chart/:admission_number', authenticate, studentDashboardController.getAttendanceChart);
router.get('/result-chart/:admission_number', authenticate, studentDashboardController.getResultChart);

module.exports = router;