class ValidatorService {
    constructor() {
        // Common regex patterns
        this.patterns = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phone: /^[0-9]{10}$/,
            phoneWithCode: /^[0-9]{10,15}$/,
            username: /^[a-zA-Z0-9_]{3,20}$/,
            password: /^.{6,}$/,
            alpha: /^[a-zA-Z\s]+$/,
            alphaNumeric: /^[a-zA-Z0-9\s]+$/,
            date: /^\d{4}-\d{2}-\d{2}$/,
            time: /^\d{2}:\d{2}$/,
            url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
            ip: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
            pincode: /^[1-9][0-9]{5}$/,
            pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
            aadhar: /^[0-9]{12}$/,
            gst: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
            studentId: /^[0-9]{5}$/,
            teacherId: /^T[0-9]{3}$/
        };
    }

    // ==================== BASIC VALIDATORS ====================

    validateEmail(email) {
        if (!email) return false;
        return this.patterns.email.test(email);
    }

    validatePhone(phone) {
        if (!phone) return false;
        return this.patterns.phone.test(phone);
    }

    validatePhoneWithCode(phone) {
        if (!phone) return false;
        return this.patterns.phoneWithCode.test(phone);
    }

    validateUsername(username) {
        if (!username) return false;
        return this.patterns.username.test(username);
    }

    validatePassword(password) {
        if (!password) return false;
        return this.patterns.password.test(password);
    }

    validatePasswordStrength(password) {
        if (!password) return { valid: false, message: 'Password is required' };

        let score = 0;
        const checks = [];
        
        if (password.length >= 8) { score++; checks.push('At least 8 characters'); }
        if (/[a-z]/.test(password)) { score++; checks.push('Contains lowercase'); }
        if (/[A-Z]/.test(password)) { score++; checks.push('Contains uppercase'); }
        if (/[0-9]/.test(password)) { score++; checks.push('Contains number'); }
        if (/[^a-zA-Z0-9]/.test(password)) { score++; checks.push('Contains special character'); }

        let strength = 'Weak';
        if (score >= 5) strength = 'Strong';
        else if (score >= 3) strength = 'Medium';

        return {
            valid: score >= 3,
            strength,
            score,
            checks,
            message: `Password strength: ${strength} (${score}/5)`
        };
    }

    validateDate(date) {
        if (!date) return false;
        const dateObj = new Date(date);
        return dateObj instanceof Date && !isNaN(dateObj) && this.patterns.date.test(date);
    }

    validateDateRange(startDate, endDate) {
        if (!startDate || !endDate) return { valid: false, message: 'Both dates are required' };
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start) || isNaN(end)) return { valid: false, message: 'Invalid date format' };
        if (start > end) return { valid: false, message: 'Start date must be before end date' };
        return { valid: true };
    }

    validateTime(time) {
        if (!time) return false;
        return this.patterns.time.test(time);
    }

    validateURL(url) {
        if (!url) return false;
        return this.patterns.url.test(url);
    }

    validateIP(ip) {
        if (!ip) return false;
        return this.patterns.ip.test(ip);
    }

    // ==================== NUMBER VALIDATORS ====================

    validateAdmissionNumber(admissionNumber) {
        if (!admissionNumber) return false;
        return admissionNumber >= 15000 && Number.isInteger(admissionNumber);
    }

    validateStudentId(studentId) {
        if (!studentId) return false;
        return this.patterns.studentId.test(studentId.toString());
    }

    validateTeacherId(teacherId) {
        if (!teacherId) return false;
        return this.patterns.teacherId.test(teacherId);
    }

    validateNumber(value, min = null, max = null) {
        if (typeof value !== 'number' || isNaN(value)) return false;
        if (min !== null && value < min) return false;
        if (max !== null && value > max) return false;
        return true;
    }

    validatePercentage(value) {
        return this.validateNumber(value, 0, 100);
    }

    validatePincode(pincode) {
        if (!pincode) return false;
        return this.patterns.pincode.test(pincode.toString());
    }

    // ==================== STRING VALIDATORS ====================

    validateClass(classValue) {
        if (!classValue) return false;
        const validClasses = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
        return validClasses.includes(classValue.toString());
    }

    validateAlpha(value) {
        if (!value) return false;
        return this.patterns.alpha.test(value);
    }

    validateAlphaNumeric(value) {
        if (!value) return false;
        return this.patterns.alphaNumeric.test(value);
    }

    validateLength(value, min = 1, max = 255) {
        if (!value) return false;
        const length = value.length;
        return length >= min && length <= max;
    }

    validateRequired(value) {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return true;
    }

    // ==================== ID VALIDATORS ====================

    validatePAN(pan) {
        if (!pan) return false;
        return this.patterns.pan.test(pan.toUpperCase());
    }

    validateAadhar(aadhar) {
        if (!aadhar) return false;
        return this.patterns.aadhar.test(aadhar.toString());
    }

    validateGST(gst) {
        if (!gst) return false;
        return this.patterns.gst.test(gst.toUpperCase());
    }

    // ==================== OBJECT VALIDATORS ====================

    validateStudentData(data) {
        const errors = [];

        if (!this.validateRequired(data.full_name)) {
            errors.push('Full name is required');
        } else if (!this.validateLength(data.full_name, 2)) {
            errors.push('Full name must be at least 2 characters');
        }

        if (!this.validateRequired(data.class) || !this.validateClass(data.class)) {
            errors.push('Valid class is required (1-12)');
        }

        if (data.phone_number && !this.validatePhone(data.phone_number)) {
            errors.push('Phone number must be 10 digits');
        }

        if (data.email && !this.validateEmail(data.email)) {
            errors.push('Invalid email format');
        }

        if (data.date_of_birth && !this.validateDate(data.date_of_birth)) {
            errors.push('Invalid date of birth');
        }

        if (data.admission_number && !this.validateAdmissionNumber(data.admission_number)) {
            errors.push('Invalid admission number');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    validateTeacherData(data) {
        const errors = [];

        if (!this.validateRequired(data.full_name)) {
            errors.push('Full name is required');
        } else if (!this.validateLength(data.full_name, 2)) {
            errors.push('Full name must be at least 2 characters');
        }

        if (!this.validateRequired(data.teacher_id)) {
            errors.push('Teacher ID is required');
        } else if (!this.validateTeacherId(data.teacher_id)) {
            errors.push('Invalid teacher ID format (e.g., T001)');
        }

        if (data.email && !this.validateEmail(data.email)) {
            errors.push('Invalid email format');
        }

        if (data.phone && !this.validatePhone(data.phone)) {
            errors.push('Phone number must be 10 digits');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    validateAttendanceData(data) {
        const errors = [];
        const validStatuses = ['present', 'absent', 'late'];

        if (!this.validateRequired(data.admission_number)) {
            errors.push('Admission number is required');
        }

        if (!data.date || !this.validateDate(data.date)) {
            errors.push('Valid date is required');
        }

        if (!data.status || !validStatuses.includes(data.status)) {
            errors.push('Valid status is required (present, absent, late)');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    validateResultData(data) {
        const errors = [];

        if (!this.validateRequired(data.admission_number)) {
            errors.push('Admission number is required');
        }

        if (!this.validateRequired(data.subject)) {
            errors.push('Subject is required');
        }

        if (!this.validateNumber(data.marks, 0)) {
            errors.push('Marks must be a positive number');
        }

        if (!this.validateNumber(data.total_marks, 1)) {
            errors.push('Total marks must be greater than 0');
        }

        if (data.marks > data.total_marks) {
            errors.push('Marks cannot exceed total marks');
        }

        if (data.exam_date && !this.validateDate(data.exam_date)) {
            errors.push('Invalid exam date');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    validateNoticeData(data) {
        const errors = [];

        if (!this.validateRequired(data.title)) {
            errors.push('Title is required');
        }

        if (!this.validateRequired(data.content)) {
            errors.push('Content is required');
        }

        if (data.date && !this.validateDate(data.date)) {
            errors.push('Invalid date');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    validateLoginData(data) {
        const errors = [];

        if (!this.validateRequired(data.teacher_id) && !this.validateRequired(data.email)) {
            errors.push('Teacher ID or email is required');
        }

        if (!this.validateRequired(data.password)) {
            errors.push('Password is required');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    validateRegistrationData(data) {
        const errors = [];

        if (!this.validateRequired(data.full_name)) {
            errors.push('Full name is required');
        }

        if (!this.validateRequired(data.email) || !this.validateEmail(data.email)) {
            errors.push('Valid email is required');
        }

        if (!this.validateRequired(data.password) || !this.validatePassword(data.password)) {
            errors.push('Password must be at least 6 characters');
        }

        if (data.password !== data.confirm_password) {
            errors.push('Passwords do not match');
        }

        if (data.phone && !this.validatePhone(data.phone)) {
            errors.push('Invalid phone number');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    // ==================== SANITIZERS ====================

    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        return input.trim()
            .replace(/[<>]/g, '')
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    sanitizeEmail(email) {
        if (!email) return '';
        return email.trim().toLowerCase();
    }

    sanitizePhone(phone) {
        if (!phone) return '';
        return phone.replace(/\D/g, '');
    }

    sanitizeName(name) {
        if (!name) return '';
        return name.trim().replace(/\s+/g, ' ');
    }

    sanitizeObject(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                sanitized[key] = this.sanitizeInput(value);
            } else if (Array.isArray(value)) {
                sanitized[key] = value.map(item => 
                    typeof item === 'string' ? this.sanitizeInput(item) : item
                );
            } else if (value && typeof value === 'object') {
                sanitized[key] = this.sanitizeObject(value);
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }

    // ==================== UTILITY VALIDATORS ====================

    validateJSON(value) {
        try {
            JSON.parse(value);
            return true;
        } catch {
            return false;
        }
    }

    validateBoolean(value) {
        return value === true || value === false || value === 'true' || value === 'false' || value === 1 || value === 0;
    }

    validateArray(value, minLength = 0, maxLength = Infinity) {
        if (!Array.isArray(value)) return false;
        return value.length >= minLength && value.length <= maxLength;
    }

    validateEnum(value, allowedValues) {
        if (!allowedValues || !Array.isArray(allowedValues)) return false;
        return allowedValues.includes(value);
    }

    validateYear(year) {
        if (!year) return false;
        const y = parseInt(year);
        const currentYear = new Date().getFullYear();
        return !isNaN(y) && y >= 1900 && y <= currentYear + 10;
    }

    validateAge(dateOfBirth) {
        if (!dateOfBirth) return { valid: false, message: 'Date of birth is required' };
        
        const birthDate = new Date(dateOfBirth);
        if (isNaN(birthDate)) {
            return { valid: false, message: 'Invalid date of birth' };
        }

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return {
            valid: age >= 3 && age <= 100,
            age,
            message: age >= 3 && age <= 100 ? 'Valid age' : `Age must be between 3 and 100 (current: ${age})`
        };
    }

    // ==================== BULK VALIDATORS ====================

    validateBulkData(items, validatorFn) {
        if (!Array.isArray(items)) {
            return { valid: false, errors: ['Data must be an array'] };
        }

        const results = [];
        let hasErrors = false;

        items.forEach((item, index) => {
            const result = validatorFn(item);
            results.push({
                index,
                ...result,
                data: item
            });
            if (!result.valid) hasErrors = true;
        });

        return {
            valid: !hasErrors,
            results,
            totalItems: items.length,
            validItems: results.filter(r => r.valid).length,
            invalidItems: results.filter(r => !r.valid).length
        };
    }

    // ==================== STRENGTH VALIDATORS ====================

    validateEmailStrength(email) {
        if (!email) return { valid: false, message: 'Email is required' };
        
        const parts = email.split('@');
        if (parts.length !== 2) return { valid: false, message: 'Invalid email format' };
        
        const [local, domain] = parts;
        
        let strength = 'weak';
        if (local.length >= 6 && domain.includes('.') && domain.split('.').length >= 2) {
            strength = 'strong';
        } else if (local.length >= 3 && domain.includes('.')) {
            strength = 'medium';
        }

        return {
            valid: true,
            strength,
            local: local.length,
            domain: domain,
            message: `Email strength: ${strength}`
        };
    }

    validatePhoneStrength(phone) {
        if (!phone) return { valid: false, message: 'Phone is required' };
        
        const clean = phone.replace(/\D/g, '');
        let strength = 'weak';
        
        if (clean.length === 10) {
            const firstDigit = clean.charAt(0);
            if (['6', '7', '8', '9'].includes(firstDigit)) {
                strength = 'strong';
            } else {
                strength = 'medium';
            }
        }

        return {
            valid: clean.length === 10,
            strength,
            length: clean.length,
            message: clean.length === 10 ? `Phone strength: ${strength}` : 'Phone must be 10 digits'
        };
    }
}

module.exports = new ValidatorService();