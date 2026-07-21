import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

export const buildDashboardStats = (students = [], notices = [], attendanceRecords = []) => {
  const activeStudents = students.filter((student) => !student.is_deleted);
  const totalStudents = activeStudents.length;
  const attendanceRate = attendanceRecords.length
    ? Math.round(
        attendanceRecords.reduce((sum, item) => sum + (Number(item.attendance_percentage) || 0), 0) /
          attendanceRecords.length
      )
    : 0;

  return {
    totalStudents,
    totalTeachers: 1,
    totalNotices: notices.length,
    attendanceRate
  };
};

const TeacherDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 1,
    totalNotices: 0,
    attendanceRate: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData && userData !== 'undefined' && userData !== 'null') {
          setUser(JSON.parse(userData));
        } else {
          navigate('/login');
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const startDate = thirtyDaysAgo.toISOString().split('T')[0];

        const [studentsRes, noticesRes, attendanceRes] = await Promise.all([
          api.get('/api/students'),
          api.get('/api/notices/recent?limit=5'),
          api.get('/api/attendance/report', {
            params: {
              start_date: startDate,
              end_date: today
            }
          })
        ]);

        const students = studentsRes.data?.data || [];
        const notices = noticesRes.data?.data || [];
        const attendance = attendanceRes.data?.data || [];

        setStats(buildDashboardStats(students, notices, attendance));
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        toast.error('Failed to load dashboard data');
        setStats(buildDashboardStats([], [], []));
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-blue-600">🏫 KV School</h1>
          <span className="text-gray-400 text-sm hidden sm:inline">| Teacher Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm hidden sm:inline">👋 {user?.full_name || 'Teacher'}</span>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user?.full_name || 'Teacher'}! 👋</h2>
          <p className="text-gray-500 mt-1">Here's what's happening with your school today.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow p-5 text-center border-l-4 border-blue-500">
            <div className="text-3xl">👨‍🎓</div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalStudents}</div>
            <div className="text-xs text-gray-500">Total Students</div>
          </div>
          <div className="bg-white rounded-xl shadow p-5 text-center border-l-4 border-green-500">
            <div className="text-3xl">👨‍🏫</div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalTeachers}</div>
            <div className="text-xs text-gray-500">Total Teachers</div>
          </div>
          <div className="bg-white rounded-xl shadow p-5 text-center border-l-4 border-purple-500">
            <div className="text-3xl">📢</div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalNotices}</div>
            <div className="text-xs text-gray-500">Total Notices</div>
          </div>
          <div className="bg-white rounded-xl shadow p-5 text-center border-l-4 border-orange-500">
            <div className="text-3xl">📊</div>
            <div className="text-2xl font-bold text-gray-800">{stats.attendanceRate}%</div>
            <div className="text-xs text-gray-500">Attendance Rate</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button onClick={() => navigate('/teacher/add-student')} className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium text-sm border border-blue-200">
              ➕ Add Student
            </button>
            <button onClick={() => navigate('/teacher/attendance')} className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-medium text-sm border border-green-200">
              📋 Mark Attendance
            </button>
            <button onClick={() => navigate('/teacher/results')} className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-yellow-700 font-medium text-sm border border-yellow-200">
              📝 Add Result
            </button>
            <button onClick={() => navigate('/teacher/notices')} className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 font-medium text-sm border border-purple-200">
              📢 Create Notice
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="text-center py-8 text-gray-400">
            <p>No recent activity</p>
            <p className="text-sm mt-1">Start managing your school!</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;