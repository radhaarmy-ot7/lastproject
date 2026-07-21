import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  FiUser,
  FiCalendar,
  FiPhone,
  FiMapPin,
  FiBookOpen,
  FiAward,
  FiTrendingUp,
  FiMail,
  FiEdit2,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiUserCheck,
  FiUsers,
  FiDownload,
  FiPrinter
} from 'react-icons/fi';

const StudentProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState({ total_days: 0, present_days: 0, absent_days: 0 });
  const [results, setResults] = useState([]);
  const [percentage, setPercentage] = useState(0);
  const [classmates, setClassmates] = useState([]);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const admissionNumber = user?.admission_number || user?.id;
      
      const response = await api.get(`/api/students/profile/${admissionNumber}`);
      
      if (response.data.success) {
        setProfile(response.data.data);
      }

      const dashboardRes = await api.get(`/api/students/dashboard/${admissionNumber}`);
      if (dashboardRes.data.success) {
        const data = dashboardRes.data.data;
        setAttendance(data.attendance || { total_days: 0, present_days: 0, absent_days: 0 });
        setResults(data.results || []);
        setPercentage(data.percentage || 0);
      }

      // Fetch classmates
      try {
        const classmateRes = await api.get(`/api/students/profile/${admissionNumber}/classmates`);
        if (classmateRes.data.success) {
          setClassmates(classmateRes.data.data.classmates || []);
        }
      } catch (error) {
        // Silently fail for classmates
      }
    } catch (error) {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A': return 'badge-success';
      case 'B':
      case 'C': return 'badge-info';
      case 'D': return 'badge-warning';
      default: return 'badge-danger';
    }
  };

  const getGradeIcon = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A': return <FiCheckCircle className="w-4 h-4 text-green-600" />;
      case 'B':
      case 'C': return <FiCheckCircle className="w-4 h-4 text-blue-600" />;
      case 'D': return <FiAlertCircle className="w-4 h-4 text-yellow-600" />;
      default: return <FiAlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getAttendanceStatus = () => {
    const percent = (attendance.present_days / attendance.total_days) * 100;
    if (percent >= 75) return { text: 'Good', color: 'text-green-600' };
    if (percent >= 50) return { text: 'Average', color: 'text-yellow-600' };
    return { text: 'Needs Improvement', color: 'text-red-600' };
  };

  const handleGenerateReport = async () => {
    try {
      const admissionNumber = user?.admission_number || user?.id;
      const response = await api.get(`/api/pdf/student/${admissionNumber}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `student_${admissionNumber}_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-700 text-3xl font-bold flex-shrink-0">
            {profile?.full_name?.charAt(0) || 'S'}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-bold text-secondary-900">
                {profile?.full_name || 'Student'}
              </h1>
              <span className="badge badge-success">Active</span>
            </div>
            <p className="text-secondary-500">
              Admission: {profile?.admission_number || user?.admission_number}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
              <span className="text-sm text-secondary-500">
                <FiBookOpen className="inline mr-1" />
                Class: {profile?.class || 'N/A'}
              </span>
              <span className="text-sm text-secondary-500">
                <FiCalendar className="inline mr-1" />
                Joined: {formatDate(profile?.joining_date)}
              </span>
              <span className={`text-sm ${getAttendanceStatus().color}`}>
                <FiUserCheck className="inline mr-1" />
                {getAttendanceStatus().text} Attendance
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleGenerateReport}
              className="btn-secondary flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Download Report
            </button>
            <button
              onClick={() => window.print()}
              className="btn-secondary flex items-center gap-2"
            >
              <FiPrinter className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center hover:shadow-hover transition-all">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FiTrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-secondary-900">{percentage}%</p>
          <p className="text-xs text-secondary-500">Overall Performance</p>
          <p className="text-xs text-secondary-400 mt-1">
            {results.length} subjects
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center hover:shadow-hover transition-all">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FiCalendar className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-secondary-900">
            {attendance.present_days || 0}/{attendance.total_days || 0}
          </p>
          <p className="text-xs text-secondary-500">Attendance</p>
          <p className="text-xs text-secondary-400 mt-1">
            {attendance.total_days > 0 ? Math.round((attendance.present_days / attendance.total_days) * 100) : 0}% rate
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center hover:shadow-hover transition-all">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FiAward className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-secondary-900">{results.length || 0}</p>
          <p className="text-xs text-secondary-500">Subjects Completed</p>
          <p className="text-xs text-secondary-400 mt-1">
            {results.filter(r => r.grade === 'A+' || r.grade === 'A').length} A grades
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
            <FiUser className="w-5 h-5 text-primary-600" />
            Personal Information
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Full Name</label>
              <p className="mt-1 text-secondary-900 font-medium">{profile?.full_name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Date of Birth</label>
              <p className="mt-1 text-secondary-900 font-medium">{formatDate(profile?.date_of_birth)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Phone Number</label>
              <p className="mt-1 text-secondary-900 font-medium">{profile?.phone_number || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Address</label>
              <p className="mt-1 text-secondary-900 font-medium">{profile?.address || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Family Information */}
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
            <FiUsers className="w-5 h-5 text-green-600" />
            Family Information
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Father's Name</label>
              <p className="mt-1 text-secondary-900 font-medium">{profile?.father_name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Mother's Name</label>
              <p className="mt-1 text-secondary-900 font-medium">{profile?.mother_name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Father's Occupation</label>
              <p className="mt-1 text-secondary-900 font-medium">{profile?.father_occupation || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Mother's Occupation</label>
              <p className="mt-1 text-secondary-900 font-medium">{profile?.mother_occupation || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Classmates */}
      {classmates.length > 0 && (
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
            <FiUsers className="w-5 h-5 text-blue-600" />
            Classmates ({classmates.length + 1} students in class {profile?.class})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {classmates.slice(0, 8).map((classmate, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                  {classmate.full_name?.charAt(0) || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary-900 truncate">{classmate.full_name}</p>
                  <p className="text-xs text-secondary-400">#{classmate.admission_number}</p>
                </div>
              </div>
            ))}
            {classmates.length > 8 && (
              <div className="flex items-center justify-center p-2 bg-secondary-50 rounded-lg text-secondary-500 text-sm">
                +{classmates.length - 8} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
              <FiAward className="w-5 h-5 text-yellow-600" />
              Recent Results
            </h3>
            <Link to="/student/results" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left py-2 text-xs font-medium text-secondary-500 uppercase">Subject</th>
                  <th className="text-left py-2 text-xs font-medium text-secondary-500 uppercase">Marks</th>
                  <th className="text-left py-2 text-xs font-medium text-secondary-500 uppercase">Total</th>
                  <th className="text-left py-2 text-xs font-medium text-secondary-500 uppercase">Percentage</th>
                  <th className="text-left py-2 text-xs font-medium text-secondary-500 uppercase">Grade</th>
                  <th className="text-left py-2 text-xs font-medium text-secondary-500 uppercase">Exam Type</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 5).map((result, index) => {
                  const percentage = ((result.marks / result.total_marks) * 100).toFixed(1);
                  return (
                    <tr key={index} className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50 transition-colors">
                      <td className="py-2 text-sm text-secondary-900 font-medium">{result.subject}</td>
                      <td className="py-2 text-sm text-secondary-900">{result.marks}</td>
                      <td className="py-2 text-sm text-secondary-900">{result.total_marks}</td>
                      <td className="py-2 text-sm text-secondary-900">{percentage}%</td>
                      <td className="py-2 text-sm">
                        <div className="flex items-center gap-1">
                          {getGradeIcon(result.grade)}
                          <span className={`badge ${getGradeColor(result.grade)}`}>
                            {result.grade || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 text-sm text-secondary-500">{result.exam_type || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;