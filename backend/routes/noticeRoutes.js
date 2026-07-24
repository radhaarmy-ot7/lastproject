const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const { authenticate, authorizeTeacher } = require('../middleware/authMiddleware');

router.post('/', authenticate, authorizeTeacher, noticeController.createNotice);
router.get('/', authenticate, noticeController.getAllNotices);
router.get('/recent', authenticate, noticeController.getRecentNotices);
router.get('/search', authenticate, noticeController.searchNotices);
router.get('/:id', authenticate, noticeController.getNoticeById);
router.put('/:id', authenticate, authorizeTeacher, noticeController.updateNotice);
router.delete('/:id', authenticate, authorizeTeacher, noticeController.deleteNotice);

module.exports = router;