const crypto = require('crypto');

class OTPService {
    constructor() {
        this.otpStore = new Map();
        this.cleanupInterval = setInterval(() => this.cleanupExpiredOTPs(), 5 * 60 * 1000); // Clean every 5 minutes
    }

    generateOTP(length = 6) {
        const digits = '0123456789';
        let otp = '';
        for (let i = 0; i < length; i++) {
            otp += digits[Math.floor(Math.random() * 10)];
        }
        return otp;
    }

    generateNumericOTP(length = 6) {
        return this.generateOTP(length);
    }

    generateAlphanumericOTP(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let otp = '';
        for (let i = 0; i < length; i++) {
            otp += chars[Math.floor(Math.random() * chars.length)];
        }
        return otp;
    }

    generateSecureOTP(length = 6) {
        const digits = '0123456789';
        let otp = '';
        const randomBytes = crypto.randomBytes(length);
        for (let i = 0; i < length; i++) {
            otp += digits[randomBytes[i] % 10];
        }
        return otp;
    }

    storeOTP(email, otp, expiryMinutes = 10) {
        this.otpStore.set(email, {
            otp,
            timestamp: Date.now(),
            expiresIn: expiryMinutes * 60 * 1000,
            attempts: 0,
            maxAttempts: 5
        });
    }

    verifyOTP(email, otp) {
        if (!this.otpStore.has(email)) {
            return { valid: false, message: 'No OTP found for this email' };
        }

        const storedData = this.otpStore.get(email);
        const elapsed = Date.now() - storedData.timestamp;

        // Check if OTP has expired
        if (elapsed > storedData.expiresIn) {
            this.otpStore.delete(email);
            return { valid: false, message: 'OTP has expired. Please request a new one.' };
        }

        // Check attempts
        if (storedData.attempts >= storedData.maxAttempts) {
            this.otpStore.delete(email);
            return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' };
        }

        // Increment attempts
        storedData.attempts += 1;
        this.otpStore.set(email, storedData);

        // Check OTP
        if (storedData.otp !== otp) {
            return { 
                valid: false, 
                message: 'Invalid OTP',
                remainingAttempts: storedData.maxAttempts - storedData.attempts
            };
        }

        // Success - delete OTP
        this.otpStore.delete(email);
        return { valid: true, message: 'OTP verified successfully' };
    }

    resendOTP(email, expiryMinutes = 10) {
        if (!this.otpStore.has(email)) {
            return { success: false, message: 'No OTP found for this email' };
        }

        const newOTP = this.generateOTP();
        this.storeOTP(email, newOTP, expiryMinutes);
        return { success: true, message: 'OTP resent successfully', otp: newOTP };
    }

    cleanupExpiredOTPs() {
        const now = Date.now();
        for (const [email, data] of this.otpStore.entries()) {
            if (now - data.timestamp > data.expiresIn) {
                this.otpStore.delete(email);
            }
        }
    }

    getOTPStatus(email) {
        if (!this.otpStore.has(email)) {
            return { exists: false };
        }

        const data = this.otpStore.get(email);
        const remainingTime = Math.max(0, (data.timestamp + data.expiresIn - Date.now()) / 1000);
        
        return {
            exists: true,
            remainingSeconds: Math.floor(remainingTime),
            remainingMinutes: Math.floor(remainingTime / 60),
            attemptsUsed: data.attempts,
            maxAttempts: data.maxAttempts
        };
    }

    deleteOTP(email) {
        if (this.otpStore.has(email)) {
            this.otpStore.delete(email);
            return { success: true };
        }
        return { success: false, message: 'OTP not found' };
    }

    clearAllOTPs() {
        this.otpStore.clear();
        return { success: true, message: 'All OTPs cleared' };
    }

    stopCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
}

module.exports = new OTPService();