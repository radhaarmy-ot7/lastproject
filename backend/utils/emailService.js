const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendVerificationEmail(email, name, otp, teacherId) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'KV School - Teacher Registration Verification',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h2 style="color: #1e293b;">KV School Management System</h2>
                            <h3 style="color: #334155;">Teacher Registration</h3>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <p style="color: #475569;">Dear <strong>${name}</strong>,</p>
                            <p style="color: #475569;">Thank you for registering as a teacher at KV School.</p>
                            <p style="color: #475569;">Your Teacher ID is: <strong style="color: #2563eb;">${teacherId}</strong></p>
                            
                            <p style="color: #475569; margin-top: 20px;">Your OTP for email verification is:</p>
                            <div style="background: #eff6ff; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 10px; font-weight: bold; border-radius: 8px; border: 2px solid #bfdbfe; color: #1e40af;">
                                ${otp}
                            </div>
                            <p style="color: #64748b; margin-top: 20px; font-size: 14px;">This OTP is valid for 10 minutes.</p>
                        </div>
                        
                        <div style="margin-top: 20px; padding: 15px; background: #f1f5f9; border-radius: 8px;">
                            <p style="color: #475569; font-size: 14px; margin: 0;">
                                <strong>Note:</strong> Your account will be activated after email verification.
                                You can log in immediately after verification.
                            </p>
                        </div>
                        
                        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
                            If you did not request this registration, please ignore this email.
                        </p>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            return { success: true, message: 'Verification email sent' };
        } catch (error) {
            console.error('Error sending verification email:', error);
            return { success: false, message: 'Failed to send verification email' };
        }
    }

    async sendWelcomeEmail(email, name, teacherId) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Welcome to KV School - Registration Complete!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h2 style="color: #1e293b;">🎉 Welcome to KV School!</h2>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <p style="color: #475569;">Dear <strong>${name}</strong>,</p>
                            <p style="color: #475569;">Your registration as a teacher has been successfully completed!</p>
                            
                            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0; margin: 15px 0;">
                                <p style="color: #166534; margin: 0;">
                                    <strong>✅ Your Account Details:</strong><br>
                                    Teacher ID: <strong>${teacherId}</strong><br>
                                    Email: <strong>${email}</strong>
                                </p>
                            </div>
                            
                            <p style="color: #475569;">You can now log in to the system using your Teacher ID and password.</p>
                            <p style="color: #475569;">Click the button below to login:</p>
                            <div style="text-align: center; margin: 20px 0;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                                   style="background: #2563eb; color: white; padding: 12px 30px; 
                                          text-decoration: none; border-radius: 8px; font-weight: bold;
                                          display: inline-block;">
                                    Go to Login
                                </a>
                            </div>
                        </div>
                        
                        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
                            © 2024 KV School Management System
                        </p>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            return { success: true, message: 'Welcome email sent' };
        } catch (error) {
            console.error('Error sending welcome email:', error);
            return { success: false, message: 'Failed to send welcome email' };
        }
    }

    async sendPasswordResetEmail(email, name, resetToken) {
        try {
            const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
            
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'KV School - Password Reset Request',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h2 style="color: #1e293b;">KV School Management System</h2>
                            <h3 style="color: #334155;">Password Reset Request</h3>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <p style="color: #475569;">Dear <strong>${name}</strong>,</p>
                            <p style="color: #475569;">We received a request to reset your password for your KV School account.</p>
                            
                            <p style="color: #475569; margin-top: 20px;">Click the button below to reset your password:</p>
                            <div style="text-align: center; margin: 20px 0;">
                                <a href="${resetLink}" 
                                   style="background: #2563eb; color: white; padding: 12px 30px; 
                                          text-decoration: none; border-radius: 8px; font-weight: bold;
                                          display: inline-block;">
                                    Reset Password
                                </a>
                            </div>
                            
                            <p style="color: #64748b; font-size: 14px;">This link will expire in 1 hour.</p>
                            <p style="color: #94a3b8; font-size: 12px; margin-top: 10px;">
                                If you did not request this, please ignore this email.
                            </p>
                        </div>
                        
                        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
                            © 2024 KV School Management System
                        </p>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            return { success: true, message: 'Password reset email sent' };
        } catch (error) {
            console.error('Error sending password reset email:', error);
            return { success: false, message: 'Failed to send password reset email' };
        }
    }

    async sendAttendanceAlert(email, name, studentName, date, status) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: `KV School - Attendance Alert for ${studentName}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h2 style="color: #1e293b;">KV School Management System</h2>
                            <h3 style="color: #334155;">Attendance Alert</h3>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <p style="color: #475569;">Dear <strong>${name}</strong>,</p>
                            <p style="color: #475569;">This is to inform you about the attendance of your child:</p>
                            
                            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
                                <p style="color: #475569; margin: 5px 0;">
                                    <strong>Student:</strong> ${studentName}
                                </p>
                                <p style="color: #475569; margin: 5px 0;">
                                    <strong>Date:</strong> ${date}
                                </p>
                                <p style="color: #475569; margin: 5px 0;">
                                    <strong>Status:</strong> 
                                    <span style="color: ${status === 'present' ? '#16a34a' : status === 'late' ? '#f59e0b' : '#dc2626'}; font-weight: bold;">
                                        ${status.toUpperCase()}
                                    </span>
                                </p>
                            </div>
                            
                            <p style="color: #64748b; font-size: 14px;">
                                Please ensure regular attendance for your child's academic success.
                            </p>
                        </div>
                        
                        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
                            © 2024 KV School Management System
                        </p>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            return { success: true, message: 'Attendance alert sent' };
        } catch (error) {
            console.error('Error sending attendance alert:', error);
            return { success: false, message: 'Failed to send attendance alert' };
        }
    }

    async sendResultNotification(email, name, studentName, examType) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: `KV School - Results Published for ${studentName}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h2 style="color: #1e293b;">KV School Management System</h2>
                            <h3 style="color: #334155;">Results Published</h3>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <p style="color: #475569;">Dear <strong>${name}</strong>,</p>
                            <p style="color: #475569;">Results for <strong>${examType}</strong> have been published for:</p>
                            
                            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0;">
                                <p style="color: #166534; margin: 5px 0;">
                                    <strong>Student:</strong> ${studentName}
                                </p>
                            </div>
                            
                            <p style="color: #475569;">Please log in to the portal to view the detailed results.</p>
                            <div style="text-align: center; margin: 20px 0;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                                   style="background: #2563eb; color: white; padding: 12px 30px; 
                                          text-decoration: none; border-radius: 8px; font-weight: bold;
                                          display: inline-block;">
                                    View Results
                                </a>
                            </div>
                        </div>
                        
                        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
                            © 2024 KV School Management System
                        </p>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            return { success: true, message: 'Result notification sent' };
        } catch (error) {
            console.error('Error sending result notification:', error);
            return { success: false, message: 'Failed to send result notification' };
        }
    }

    async sendBulkEmail(recipients, subject, htmlContent) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: recipients.join(','),
                subject: subject,
                html: htmlContent
            };

            await this.transporter.sendMail(mailOptions);
            return { success: true, message: 'Bulk email sent' };
        } catch (error) {
            console.error('Error sending bulk email:', error);
            return { success: false, message: 'Failed to send bulk email' };
        }
    }
}

module.exports = new EmailService();