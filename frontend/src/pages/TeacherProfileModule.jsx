import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiEdit,
  FiSave,
  FiX,
  FiKey,
  FiRefreshCw,
  FiActivity,
  FiUserCheck,
  FiUsers,
  FiAward,
  FiClock,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiBookOpen,
  FiBriefcase
} from 'react-icons/fi';

const TeacherProfileModule = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [stats, setStats] = useState({
    totalActivities: 0,
    studentsManaged: 0,
    daysActive: 0,
    totalNotices: 0
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/teachers/profile/${user?.teacher_id}`);
      
      if (response.data.success) {
        setProfile(response.data.data);
        setEditForm(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(`/api/teachers/profile/${user?.teacher_id}/stats`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      // Silently fail for stats
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({ ...profile });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      const response = await api.put(`/api/teachers/profile/${user?.teacher_id}`, editForm);
      
      if (response.data.success) {
        toast.success('Profile updated successfully');
        setProfile(editForm);
        setIsEditing(false);
        // Update user in context
        const updatedUser = { ...user, ...editForm };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
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

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (name === 'new_password') {
      checkPasswordStrength(value);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const response = await api.put(`/api/teachers/profile/${user?.teacher_id}/password`, {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      
      if (response.data.success) {
        toast.success('Password changed successfully');
        setShowPasswordForm(false);
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        setPasswordStrength({ score: 0, message: '', color: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    if (!name) return 'T';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-secondary-500 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-card p-6 text-white">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 border-4 border-white/30">
            {getInitials(profile?.full_name)}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-bold">
                {profile?.full_name || 'Teacher'}
              </h1>
              <span className="px-3 py-1 bg-green-500 rounded-full text-xs font-medium flex items-center gap-1">
                <FiCheckCircle className="w-3 h-3" />
                Active
              </span>
            </div>
            <p className="text-primary-100">Teacher ID: {profile?.teacher_id || user?.teacher_id}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2">
              <span className="text-sm text-primary-100 flex items-center gap-1">
                <FiCalendar className="w-4 h-4" />
                Joined: {formatDate(profile?.joining_date)}
              </span>
              <span className="text-sm text-primary-100 flex items-center gap-1">
                <FiClock className="w-4 h-4" />
                Member since {formatDate(profile?.created_at)}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="btn-primary bg-white text-primary-700 hover:bg-primary-50 flex items-center justify-center gap-2"
              >
                <FiEdit className="w-4 h-4" />
                Edit Profile
              </button>
            )}
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="btn-secondary bg-white/20 text-white hover:bg-white/30 border border-white/30 flex items-center justify-center gap-2"
            >
              <FiKey className="w-4 h-4" />
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center hover:shadow-hover transition-all">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FiActivity className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-secondary-900">{stats.totalActivities || 0}</p>
          <p className="text-xs text-secondary-500">Total Activities</p>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center hover:shadow-hover transition-all">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FiUsers className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-secondary-900">{stats.studentsManaged || 0}</p>
          <p className="text-xs text-secondary-500">Students Managed</p>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center hover:shadow-hover transition-all">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FiCalendar className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-secondary-900">{stats.daysActive || 0}</p>
          <p className="text-xs text-secondary-500">Days Active</p>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center hover:shadow-hover transition-all">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FiAward className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-secondary-900">{stats.totalNotices || 0}</p>
          <p className="text-xs text-secondary-500">Notices Published</p>
        </div>
      </div>

      {/* Password Change Form */}
      {showPasswordForm && (
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
              <FiKey className="w-5 h-5 text-primary-600" />
              Change Password
            </h3>
            <button
              onClick={() => {
                setShowPasswordForm(false);
                setPasswordData({
                  current_password: '',
                  new_password: '',
                  confirm_password: ''
                });
                setPasswordStrength({ score: 0, message: '', color: '' });
              }}
              className="text-secondary-400 hover:text-secondary-600"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="input-label">Current Password *</label>
              <input
                type="password"
                name="current_password"
                value={passwordData.current_password}
                onChange={handlePasswordInputChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="input-label">New Password *</label>
              <input
                type="password"
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordInputChange}
                className="input-field"
                required
                minLength="6"
              />
              {passwordData.new_password && (
                <div className="mt-1 flex items-center gap-2">
                  <span className={`text-sm font-medium ${passwordStrength.color}`}>
                    Strength: {passwordStrength.message}
                  </span>
                  <div className="flex-1 h-1.5 bg-secondary-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.score >= 4 ? 'bg-green-500' :
                        passwordStrength.score >= 3 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="input-label">Confirm New Password *</label>
              <input
                type="password"
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={handlePasswordInputChange}
                className="input-field"
                required
              />
              {passwordData.confirm_password && passwordData.new_password && (
                <p className={`text-xs mt-1 flex items-center gap-1 ${
                  passwordData.new_password === passwordData.confirm_password 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {passwordData.new_password === passwordData.confirm_password 
                    ? <FiCheckCircle className="w-3 h-3" /> 
                    : <FiAlertCircle className="w-3 h-3" />}
                  {passwordData.new_password === passwordData.confirm_password 
                    ? 'Passwords match' 
                    : 'Passwords do not match'}
                </p>
              )}
            </div>
            <div className="flex gap-2 pt-2 border-t border-secondary-100">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                  });
                  setPasswordStrength({ score: 0, message: '', color: '' });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Profile Information */}
      <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
            <FiUser className="w-5 h-5 text-primary-600" />
            Profile Information
          </h3>
          {isEditing && (
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={loading}
                className="btn-success flex items-center gap-2"
              >
                <FiSave className="w-4 h-4" />
                Save Changes
              </button>
              <button
                onClick={handleCancelEdit}
                className="btn-secondary flex items-center gap-2"
              >
                <FiX className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="bg-secondary-50 rounded-lg p-4">
            <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider flex items-center gap-1">
              <FiUser className="w-3 h-3" />
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="full_name"
                value={editForm.full_name || ''}
                onChange={handleInputChange}
                className="mt-1 w-full input-field"
              />
            ) : (
              <p className="mt-1 text-secondary-900 font-medium">{profile?.full_name || 'N/A'}</p>
            )}
          </div>

          {/* Teacher ID */}
          <div className="bg-secondary-50 rounded-lg p-4">
            <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider flex items-center gap-1">
              <FiShield className="w-3 h-3" />
              Teacher ID
            </label>
            <p className="mt-1 text-secondary-900 font-medium">{profile?.teacher_id || user?.teacher_id}</p>
          </div>

          {/* Email */}
          <div className="bg-secondary-50 rounded-lg p-4">
            <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider flex items-center gap-1">
              <FiMail className="w-3 h-3" />
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={editForm.email || ''}
                onChange={handleInputChange}
                className="mt-1 w-full input-field"
              />
            ) : (
              <p className="mt-1 text-secondary-900 font-medium">{profile?.email || 'N/A'}</p>
            )}
          </div>

          {/* Phone */}
          <div className="bg-secondary-50 rounded-lg p-4">
            <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider flex items-center gap-1">
              <FiPhone className="w-3 h-3" />
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={editForm.phone || ''}
                onChange={handleInputChange}
                className="mt-1 w-full input-field"
              />
            ) : (
              <p className="mt-1 text-secondary-900 font-medium">{profile?.phone || 'N/A'}</p>
            )}
          </div>

          {/* Joining Date */}
          <div className="bg-secondary-50 rounded-lg p-4">
            <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider flex items-center gap-1">
              <FiCalendar className="w-3 h-3" />
              Joining Date
            </label>
            {isEditing ? (
              <input
                type="date"
                name="joining_date"
                value={editForm.joining_date || ''}
                onChange={handleInputChange}
                className="mt-1 w-full input-field"
              />
            ) : (
              <p className="mt-1 text-secondary-900 font-medium">{formatDate(profile?.joining_date)}</p>
            )}
          </div>

          {/* Member Since */}
          <div className="bg-secondary-50 rounded-lg p-4">
            <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider flex items-center gap-1">
              <FiClock className="w-3 h-3" />
              Member Since
            </label>
            <p className="mt-1 text-secondary-900 font-medium">{formatDate(profile?.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => window.location.href = '/teacher/students'}
          className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 hover:shadow-hover transition-all text-center"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FiUsers className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-secondary-900">Students</p>
          <p className="text-xs text-secondary-400">View all students</p>
        </button>
        <button
          onClick={() => window.location.href = '/teacher/attendance'}
          className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 hover:shadow-hover transition-all text-center"
        >
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FiCalendar className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm font-medium text-secondary-900">Attendance</p>
          <p className="text-xs text-secondary-400">Mark attendance</p>
        </button>
        <button
          onClick={() => window.location.href = '/teacher/notices'}
          className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 hover:shadow-hover transition-all text-center"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FiAward className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-sm font-medium text-secondary-900">Notices</p>
          <p className="text-xs text-secondary-400">Manage notices</p>
        </button>
        <button
          onClick={() => window.location.href = '/teacher/results'}
          className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 hover:shadow-hover transition-all text-center"
        >
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FiAward className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-sm font-medium text-secondary-900">Results</p>
          <p className="text-xs text-secondary-400">Manage results</p>
        </button>
      </div>
    </div>
  );
};

export default TeacherProfileModule;