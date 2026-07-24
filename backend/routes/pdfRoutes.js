const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { authenticate, authorizeTeacher } = require('../middleware/authMiddleware');

router.get('/student/:admission_number', authenticate, authorizeTeacher, pdfController.generateStudentPDF);
router.get('/bulk', authenticate, authorizeTeacher, pdfController.generateBulkPDF);

module.exports = router;