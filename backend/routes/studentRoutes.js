const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, authorizeTeacher } = require('../middleware/authMiddleware');

router.get('/', authenticate, authorizeTeacher, studentController.getAllStudents);
router.post('/', authenticate, authorizeTeacher, studentController.addStudent);
router.get('/:admission_number', authenticate, studentController.searchStudent);
router.put('/:admission_number', authenticate, authorizeTeacher, studentController.updateStudent);
router.get('/stats/all', authenticate, authorizeTeacher, studentController.getStudentStats);
router.post('/bulk', authenticate, authorizeTeacher, studentController.bulkAddStudents);

module.exports = router;