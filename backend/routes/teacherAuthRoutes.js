const express = require('express');
const router = express.Router();
const teacherAuthController = require('../controllers/teacherAuthController');

// Login route
router.post('/login', teacherAuthController.teacherLogin);

// Test route - to verify the router is working
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Teacher auth router is working!'
    });
});

// Register route (if you have one)
router.post('/register', (req, res) => {
    res.json({
        success: true,
        message: 'Register endpoint - coming soon!'
    });
});

module.exports = router;