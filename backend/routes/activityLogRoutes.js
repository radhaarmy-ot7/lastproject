const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const { authenticate, authorizeTeacher } = require('../middleware/authMiddleware');

router.get('/', authenticate, authorizeTeacher, activityLogController.getAllLogs);
router.get('/teacher/:teacher_id', authenticate, authorizeTeacher, activityLogController.getTeacherLogs);
router.get('/recent', authenticate, authorizeTeacher, activityLogController.getRecentLogs);
router.get('/summary', authenticate, authorizeTeacher, activityLogController.getActivitySummary);
router.delete('/old-logs', authenticate, authorizeTeacher, activityLogController.deleteOldLogs);
router.get('/date-range', authenticate, authorizeTeacher, activityLogController.getLogsByDateRange);

module.exports = router;