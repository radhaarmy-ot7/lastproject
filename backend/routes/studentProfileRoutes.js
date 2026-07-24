const express = require('express');
const router = express.Router();
const studentProfileController = require('../controllers/studentProfileController');
const { authenticate, authorizeTeacher } = require('../middleware/authMiddleware');

router.get('/profile/:admission_number', authenticate, studentProfileController.getStudentProfile);
router.get('/profile/:admission_number/details', authenticate, studentProfileController.getStudentProfileWithDetails);
router.get('/profile/:admission_number/classmates', authenticate, studentProfileController.getStudentClassmates);
router.put('/profile/:admission_number', authenticate, authorizeTeacher, studentProfileController.updateStudentProfile);

module.exports = router;