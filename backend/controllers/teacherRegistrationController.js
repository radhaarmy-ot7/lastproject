const TeacherModel = require('../models/teacherModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Store registration data temporarily
const registrationStore = new Map();

exports.registerTeacher = async (req, res) => {
    try {
        const { full_name, email, phone, joining_date, password } = req.body;

        console.log('📝 Registration attempt:', { full_name, email });

        // Validate
        if (!full_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Full name, email, and password are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Check if email already exists
        const existingTeacher = await TeacherModel.findByEmail(email);
        if (existingTeacher) {
            return res.status(400).json({
                success: false,
                message: 'This email is already registered'
            });
        }

        // Generate Teacher ID
        const teacher_id = await TeacherModel.getNextTeacherId();
        console.log('✅ Generated Teacher ID:', teacher_id);

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create teacher directly (skip email verification for testing)
        const teacherData = {
            teacher_id,
            full_name,
            email,
            phone: phone || '',
            joining_date: joining_date || new Date().toISOString().split('T')[0],
            password: hashedPassword,
            is_verified: true,
            is_active: true
        };

        await TeacherModel.createTeacher(teacherData);

        // Log activity
        await TeacherModel.logActivity(teacher_id, 'REGISTER', {
            email: email,
            timestamp: new Date().toISOString()
        });

        // Generate JWT token for auto-login
        const token = jwt.sign(
            {
                id: teacher_id,
                role: 'teacher',
                name: full_name,
                email: email
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please login.',
            token,
            user: {
                teacher_id: teacher_id,
                full_name: full_name,
                email: email,
                role: 'teacher'
            }
        });
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed: ' + error.message
        });
    }
};

exports.verifyOTP = async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'OTP verification skipped (auto-verified)'
    });
};

exports.resendOTP = async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'OTP resend skipped'
    });
};

exports.checkEmailAvailability = async (req, res) => {
    try {
        const { email } = req.query;
        const existingTeacher = await TeacherModel.findByEmail(email);
        res.json({
            success: true,
            available: !existingTeacher
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to check email'
        });
    }
};