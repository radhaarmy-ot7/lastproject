const express = require('express');
const router = express.Router();
const teacherAuthController = require('../controllers/teacherAuthController');

router.post('/login', teacherAuthController.teacherLogin);

module.exports = router;