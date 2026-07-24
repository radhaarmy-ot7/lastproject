const express = require('express');
const router = express.Router();
const teacherRegistrationController = require('../controllers/teacherRegistrationController');

// Public routes (no authentication required)
router.post('/register', teacherRegistrationController.registerTeacher);
router.post('/verify-otp', teacherRegistrationController.verifyOTP);
router.post('/resend-otp', teacherRegistrationController.resendOTP);
router.get('/check-email', teacherRegistrationController.checkEmailAvailability);

module.exports = router;