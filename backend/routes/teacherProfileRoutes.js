const express = require('express');
const router = express.Router();
const teacherProfileController = require('../controllers/teacherProfileController');
const { authenticate, authorizeTeacher } = require('../middleware/authMiddleware');

router.get('/profile/:teacher_id', authenticate, authorizeTeacher, teacherProfileController.getTeacherProfile);
router.put('/profile/:teacher_id', authenticate, authorizeTeacher, teacherProfileController.updateTeacherProfile);
router.put('/profile/:teacher_id/password', authenticate, authorizeTeacher, teacherProfileController.changePassword);
router.get('/profile/:teacher_id/stats', authenticate, authorizeTeacher, teacherProfileController.getTeacherStats);
router.get('/profile/:teacher_id/logs', authenticate, authorizeTeacher, teacherProfileController.getTeacherActivityLogs);

module.exports = router;