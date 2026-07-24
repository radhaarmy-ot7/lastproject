module.exports = {
    ROLES: {
        TEACHER: 'teacher',
        STUDENT: 'student'
    },

    ATTENDANCE_STATUS: {
        PRESENT: 'present',
        ABSENT: 'absent',
        LATE: 'late'
    },

    EXAM_TYPES: {
        MID_TERM: 'mid_term',
        FINAL: 'final',
        QUIZ: 'quiz',
        ASSIGNMENT: 'assignment',
        PRACTICAL: 'practical'
    },

    GRADE_RANGES: {
        'A+': { min: 90, max: 100 },
        'A': { min: 80, max: 89 },
        'B': { min: 70, max: 79 },
        'C': { min: 60, max: 69 },
        'D': { min: 50, max: 59 },
        'F': { min: 0, max: 49 }
    },

    ADMISSION_START: 15000,

    PASSWORD_MIN_LENGTH: 6,

    OTP_EXPIRY: 10 * 60 * 1000, // 10 minutes

    JWT_EXPIRY: '7d',

    LOG_ACTIONS: {
        LOGIN: 'LOGIN',
        LOGOUT: 'LOGOUT',
        STUDENT_ADD: 'STUDENT_ADD',
        STUDENT_UPDATE: 'STUDENT_UPDATE',
        STUDENT_DELETE: 'STUDENT_DELETE',
        STUDENT_RESTORE: 'STUDENT_RESTORE',
        ATTENDANCE_MARK: 'ATTENDANCE_MARK',
        RESULT_ADD: 'RESULT_ADD',
        RESULT_UPDATE: 'RESULT_UPDATE',
        RESULT_DELETE: 'RESULT_DELETE',
        NOTICE_CREATE: 'NOTICE_CREATE',
        NOTICE_UPDATE: 'NOTICE_UPDATE',
        NOTICE_DELETE: 'NOTICE_DELETE',
        PROFILE_UPDATE: 'PROFILE_UPDATE',
        PASSWORD_CHANGE: 'PASSWORD_CHANGE',
        REGISTER: 'REGISTER',
        STUDENT_PROFILE_UPDATE: 'STUDENT_PROFILE_UPDATE',
        STUDENT_PASSWORD_RESET: 'STUDENT_PASSWORD_RESET',
        BULK_ATTENDANCE_MARK: 'BULK_ATTENDANCE_MARK',
        LOGS_CLEANUP: 'LOGS_CLEANUP',
        STUDENT_PERMANENT_DELETE: 'STUDENT_PERMANENT_DELETE',
        TEACHER_LOGIN: 'TEACHER_LOGIN',
        TEACHER_LOGOUT: 'TEACHER_LOGOUT',
        TEACHER_PROFILE_UPDATE: 'TEACHER_PROFILE_UPDATE',
        TEACHER_PASSWORD_CHANGE: 'TEACHER_PASSWORD_CHANGE'
    },

    CACHE_KEYS: {
        STUDENTS: 'students',
        TEACHERS: 'teachers',
        ATTENDANCE: 'attendance',
        RESULTS: 'results',
        NOTICES: 'notices',
        ACTIVITY_LOGS: 'activity_logs'
    },

    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,

    // HTTP Status Codes
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        SERVER_ERROR: 500
    },

    // Error Messages
    ERROR_MESSAGES: {
        AUTH_REQUIRED: 'Authentication required',
        INVALID_TOKEN: 'Invalid or expired token',
        ACCESS_DENIED: 'Access denied',
        NOT_FOUND: 'Resource not found',
        SERVER_ERROR: 'Internal server error',
        INVALID_CREDENTIALS: 'Invalid credentials',
        EMAIL_EXISTS: 'Email already exists',
        INVALID_EMAIL: 'Invalid email format',
        PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
        PASSWORD_MISMATCH: 'Passwords do not match',
        OTP_EXPIRED: 'OTP has expired',
        OTP_INVALID: 'Invalid OTP'
    },

    // File Upload Limits
    FILE_UPLOAD: {
        MAX_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
    },

    // Date Formats
    DATE_FORMATS: {
        DEFAULT: 'YYYY-MM-DD',
        DISPLAY: 'MMM DD, YYYY',
        DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm',
        TIME: 'HH:mm'
    }
};