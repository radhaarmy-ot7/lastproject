const express = require('express');
const router = express.Router();
const studentReportController = require('../controllers/studentReportController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/report/:admission_number', authenticate, studentReportController.getStudentReport);
router.get('/report-card/:admission_number', authenticate, studentReportController.getStudentReportCard);
router.get('/progress/:admission_number', authenticate, studentReportController.getStudentProgressReport);

module.exports = router;