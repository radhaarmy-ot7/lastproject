const express = require('express');
const router = express.Router();
const studentAuthController = require('../controllers/studentAuthController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/login', studentAuthController.studentLogin);
router.post('/logout', authenticate, studentAuthController.studentLogout);
router.post('/validate', studentAuthController.validateToken);
router.put('/password/:admission_number', authenticate, studentAuthController.changeStudentPassword);
router.put('/reset-password/:admission_number', authenticate, studentAuthController.resetStudentPassword);

module.exports = router;