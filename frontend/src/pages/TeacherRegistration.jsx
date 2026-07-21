import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiLock,
  FiCheck,
  FiArrowLeft,
  FiSend,
  FiRefreshCw,
  FiInfo,
  FiEye,
  FiEyeOff,
  FiShield,
  FiUserCheck
} from 'react-icons/fi';

const TeacherRegistration = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    joining_date: new Date().toISOString().split('T')[0],
    password: '',
    confirm_password: ''
  });
  const [otpData, setOtpData] = useState({
    email: '',
    otp: ''
  });
  const [teacherId, setTeacherId] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const handleOtpChange = (e) => {
    const { name, value } = e.target;
    setOtpData(prev => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const strength = {
      score,
      message: score >= 4 ? 'Strong' : score >= 3 ? 'Medium' : 'Weak',
      color: score >= 4 ? 'text-green-600' : score >= 3 ? 'text-yellow-600' : 'text-red-600'
    };
    setPasswordStrength(strength);
    return strength;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.full_name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/teachers/register', {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        joining_date: formData.joining_date,
        password: formData.password
      });

      const loginData = response.data?.data || response.data;

      if (response.data?.success || loginData?.token) {
        // If we got a token, login directly (skip OTP)
        const token = loginData?.token || response.data?.token;
        const user = loginData?.user || response.data?.user;

        if (token && user) {
          login(token, user);
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          toast.success('Registration successful! Welcome to KV School! 🎉');
          navigate('/teacher/dashboard');
        } else {
          // Otherwise go to OTP step
          setTeacherId(loginData?.teacher_id || response.data?.data?.teacher_id);
          setOtpData(prev => ({ ...prev, email: formData.email }));
          setStep(2);
          toast.success('Registration successful! Please verify your email.');
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      console.error('Registration error:', error.response?.data);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otpData.otp || otpData.otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/teachers/verify-otp', {
        email: otpData.email,
        otp: otpData.otp
      });

      if (response.data.success) {
        login(response.data.token, response.data.user);
        toast.success('Email verified! Welcome to KV School! 🎉');
        navigate('/teacher/dashboard');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'OTP verification failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);

    try {
      const response = await api.post('/api/teachers/resend-otp', {
        email: otpData.email
      });

      if (response.data.success) {
        toast.success('OTP resent successfully!');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-soft p-8 animate-fadeIn">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
              <span className="text-white font-bold text-2xl">KV</span>
            </div>
            <h1 className="text-2xl font-bold text-secondary-900">
              Teacher Registration
            </h1>
            <p className="text-secondary-500 text-sm mt-1">
              {step === 1 ? 'Create your teacher account' : 'Verify your email'}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step === 1 ? 'bg-primary-600 text-white' : 'bg-green-500 text-white'
            }`}>
              {step === 1 ? '1' : '✓'}
            </div>
            <div className={`w-12 h-0.5 ${step === 2 ? 'bg-green-500' : 'bg-secondary-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step === 2 ? 'bg-primary-600 text-white' : 'bg-secondary-200 text-secondary-500'
            }`}>
              2
            </div>
          </div>

          {/* Registration Form - Step 1 */}
          {step === 1 && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="input-label flex items-center gap-1">
                  <FiUser className="w-4 h-4" />
                  Full Name *
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="input-label flex items-center gap-1">
                  <FiMail className="w-4 h-4" />
                  Email Address *
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="input-field pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-secondary-400 mt-1 flex items-center gap-1">
                  <FiInfo className="w-3 h-3" />
                  We'll send a verification code to this email
                </p>
              </div>

              <div>
                <label className="input-label flex items-center gap-1">
                  <FiPhone className="w-4 h-4" />
                  Phone Number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number (optional)"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="input-label flex items-center gap-1">
                  <FiCalendar className="w-4 h-4" />
                  Joining Date
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
                  <input
                    type="date"
                    name="joining_date"
                    value={formData.joining_date}
                    onChange={handleChange}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="input-label flex items-center gap-1">
                  <FiLock className="w-4 h-4" />
                  Password *
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="input-field pl-10 pr-10"
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      Strength: {passwordStrength.message}
                    </span>
                    <div className="flex-1 h-1 bg-secondary-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.score >= 4 ? 'bg-green-500' :
                          passwordStrength.score >= 3 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="input-label flex items-center gap-1">
                  <FiLock className="w-4 h-4" />
                  Confirm Password *
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="input-field pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                  >
                    {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.confirm_password && formData.password && (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${
                    formData.password === formData.confirm_password 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {formData.password === formData.confirm_password 
                      ? '✓ Passwords match' 
                      : '✗ Passwords do not match'}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Registering...
                  </>
                ) : (
                  <>
                    <FiSend className="w-5 h-5" />
                    Register
                  </>
                )}
              </button>
            </form>
          )}

          {/* OTP Verification - Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FiCheck className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-green-700">
                  We've sent a verification code to:
                </p>
                <p className="font-semibold text-green-800">{otpData.email}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center justify-center gap-1">
                  <FiShield className="w-3 h-3" />
                  Teacher ID: <strong>{teacherId}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="input-label">Enter OTP *</label>
                  <input
                    type="text"
                    name="otp"
                    value={otpData.otp}
                    onChange={handleOtpChange}
                    placeholder="Enter 6-digit OTP"
                    className="input-field text-center text-2xl tracking-widest"
                    maxLength="6"
                    required
                  />
                  <p className="text-xs text-secondary-400 mt-1 text-center">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-5 h-5" />
                      Verify & Login
                    </>
                  )}
                </button>
              </form>

              <div className="text-center">
                <p className="text-sm text-secondary-500">
                  Didn't receive the code?
                  <button
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="ml-2 text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                  >
                    <FiRefreshCw className="inline w-4 h-4 mr-1" />
                    Resend OTP
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-secondary-500">
              Already have an account?
              <Link to="/login" className="ml-2 text-primary-600 hover:text-primary-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>

          {step === 2 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setStep(1);
                  setOtpData({ email: '', otp: '' });
                }}
                className="text-sm text-secondary-400 hover:text-secondary-600 flex items-center justify-center gap-1"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back to registration
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherRegistration;