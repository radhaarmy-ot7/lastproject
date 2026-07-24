const express = require('express');
const router = express.Router();
const studentDeleteController = require('../controllers/studentDeleteController');
const { authenticate, authorizeTeacher } = require('../middleware/authMiddleware');

router.delete('/:admission_number', authenticate, authorizeTeacher, studentDeleteController.softDeleteStudent);
router.put('/restore/:admission_number', authenticate, authorizeTeacher, studentDeleteController.restoreStudent);
router.get('/deleted/all', authenticate, authorizeTeacher, studentDeleteController.getDeletedStudents);
router.delete('/permanent/:admission_number', authenticate, authorizeTeacher, studentDeleteController.permanentDeleteStudent);
router.get('/deleted/stats', authenticate, authorizeTeacher, studentDeleteController.getDeletedStudentStats);

module.exports = router;