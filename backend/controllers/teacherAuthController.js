// backend/controllers/teacherAuthController.js
const db = require('../config/database');

const teacherLogin = async (req, res) => {
    console.log('📝 Login request received:', req.body);
    
    try {
        const { teacherId, password } = req.body;
        
        // Validate input
        if (!teacherId || !password) {
            console.log('❌ Missing credentials');
            return res.status(400).json({
                success: false,
                message: 'Teacher ID and password are required'
            });
        }

        // For testing - hardcoded credentials
        // Remove this once your database is set up
        if (teacherId === 'T001' && password === 'teacher123') {
            console.log('✅ Hardcoded login successful for T001');
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                token: 'test-token-12345',
                user: {
                    id: 1,
                    teacherId: 'T001',
                    name: 'Test Teacher',
                    email: 'test@school.com'
                }
            });
        }

        // If hardcoded fails, try database
        try {
            const [rows] = await db.query(
                'SELECT * FROM teachers WHERE teacher_id = ?',
                [teacherId]
            );

            if (rows.length === 0) {
                console.log('❌ Teacher not found:', teacherId);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            const teacher = rows[0];
            
            // In production, compare hashed passwords
            // For now, plain text comparison
            if (teacher.password !== password) {
                console.log('❌ Password mismatch for:', teacherId);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Generate simple token (replace with JWT in production)
            const token = Buffer.from(`${teacher.teacher_id}:${Date.now()}`).toString('base64');

            console.log('✅ Database login successful for:', teacherId);
            res.status(200).json({
                success: true,
                message: 'Login successful',
                token: token,
                user: {
                    id: teacher.id,
                    teacherId: teacher.teacher_id,
                    name: teacher.name,
                    email: teacher.email
                }
            });

        } catch (dbError) {
            console.error('❌ Database query error:', dbError);
            // If database fails, fallback to hardcoded
            if (teacherId === 'T001' && password === 'teacher123') {
                console.log('✅ Fallback hardcoded login successful for T001');
                return res.status(200).json({
                    success: true,
                    message: 'Login successful (fallback)',
                    token: 'test-token-12345',
                    user: {
                        id: 1,
                        teacherId: 'T001',
                        name: 'Test Teacher',
                        email: 'test@school.com'
                    }
                });
            }
            throw dbError;
        }

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
};

module.exports = { teacherLogin };