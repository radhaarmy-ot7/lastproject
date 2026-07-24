require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const db = require('./config/database');
const logger = require('./utils/loggerService');

// Import routes
const studentRoutes = require('./routes/studentRoutes');
const studentDeleteRoutes = require('./routes/studentDeleteRoutes');
const studentAuthRoutes = require('./routes/studentAuthRoutes');
const studentDashboardRoutes = require('./routes/studentDashboardRoutes');
const studentProfileRoutes = require('./routes/studentProfileRoutes');
const studentReportRoutes = require('./routes/studentReportRoutes');
const teacherAuthRoutes = require('./routes/teacherAuthRoutes');
const teacherProfileRoutes = require('./routes/teacherProfileRoutes');
const teacherRegistrationRoutes = require('./routes/teacherRegistrationRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const resultRoutes = require('./routes/resultRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');
const pdfRoutes = require('./routes/pdfRoutes');

// Create express app
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet - Security headers
app.use(helmet());

// CORS - Cross-Origin Resource Sharing
const allowedOrigins = [
    process.env.CORS_ORIGIN,
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:4173',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:4173',
    'http://127.0.0.1:5173'
].filter(Boolean);

const isAllowedOrigin = (origin) => {
    if (!origin) return true;

    if (allowedOrigins.includes(origin)) return true;

    try {
        const { protocol, hostname } = new URL(origin);
        return ['http:', 'https:'].includes(protocol) && ['localhost', '127.0.0.1', '::1'].includes(hostname);
    } catch {
        return false;
    }
};

const corsOptions = {
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200
};
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// Compression - Gzip compression
app.use(compression());

// Rate Limiting - Prevent brute force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// ============================================
// BODY PARSING MIDDLEWARE
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// REQUEST LOGGING MIDDLEWARE
// ============================================

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.logRequest(req);
        logger.logResponse(req, res, duration);
    });
    next();
});

// ============================================
// DATABASE CONNECTION
// ============================================

db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        logger.error('Database connection failed: ' + err.message);
        process.exit(1);
    }
    console.log('✅ MySQL connected successfully');
    logger.info('MySQL connected successfully');
    connection.release();
});

// ============================================
// ROUTES
// ============================================

app.use('/api/students', studentRoutes);
app.use('/api/students', studentDeleteRoutes);
app.use('/api/students', studentAuthRoutes);
app.use('/api/students', studentDashboardRoutes);
app.use('/api/students', studentProfileRoutes);
app.use('/api/students', studentReportRoutes);
app.use('/api/teachers', teacherAuthRoutes);
app.use('/api/teachers', teacherProfileRoutes);
app.use('/api/teachers', teacherRegistrationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/pdf', pdfRoutes);

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', async (req, res) => {
    try {
        const dbStatus = await db.getConnection()
            .then(() => 'connected')
            .catch(() => 'disconnected');
        
        res.json({
            status: 'OK',
            message: 'Server is running',
            database: dbStatus,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Health check failed',
            error: error.message
        });
    }
});

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
    });
});

// ============================================
// GLOBAL ERROR HANDLING MIDDLEWARE
// ============================================

app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    console.error('Stack:', err.stack);
    
    logger.logError(err, req);
    
    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        timestamp: new Date().toISOString()
    });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API URL: http://localhost:${PORT}/api`);
    console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
    logger.info(`Server started on port ${PORT}`);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received. Shutting down gracefully...');
    logger.info('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received. Shutting down gracefully...');
    logger.info('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    logger.error('Unhandled Rejection: ' + reason);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    logger.error('Uncaught Exception: ' + error.message);
    process.exit(1);
});