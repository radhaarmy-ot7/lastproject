const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const { authenticate, authorizeTeacher } = require('../middleware/authMiddleware');

router.post('/', authenticate, authorizeTeacher, resultController.addResult);
router.get('/student/:admission_number', authenticate, resultController.getStudentResults);
router.get('/summary/:admission_number', authenticate, resultController.getResultSummary);
router.delete('/:result_id', authenticate, authorizeTeacher, resultController.deleteResult);
router.put('/:result_id', authenticate, authorizeTeacher, resultController.updateResult);
router.get('/exam-type/:admission_number', authenticate, resultController.getResultsByExamType);
router.get('/exam-types/all', authenticate, resultController.getExamTypes);

module.exports = router;