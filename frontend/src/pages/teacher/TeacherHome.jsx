import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FiUsers, 
  FiUserCheck, 
  FiUserX, 
  FiCalendar, 
  FiBarChart2, 
  FiBell,
  FiActivity,
  FiPlus,
  FiSearch,
  FiFileText,
  FiTrendingUp,
  FiClock,
  FiAward,
  FiBookOpen,
  FiChevronRight
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const TeacherHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    deletedStudents: 0,
    todayAttendance: 0,
    totalNotices: 0,
    recentActivities: []
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [classDistribution, setClassDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch students
      const studentsRes = await api.get('/api/students');
      const students = studentsRes.data.data || [];
      
      // Fetch attendance summary
      const attendanceRes = await api.get('/api/attendance/report', {
        params: {
          start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0]
        }
      });
      
      // Fetch notices
      const noticesRes = await api.get('/api/notices/recent?limit=5');
      
      // Fetch activity logs
      const logsRes = await api.get('/api/activity-logs/recent?limit=5');

      // Calculate stats
      const activeStudents = students.filter(s => !s.is_deleted);
      const deletedStudents = students.filter(s => s.is_deleted);

      // Calculate class distribution
      const classMap = {};
      students.forEach(s => {
        if (s.class) {
          classMap[s.class] = (classMap[s.class] || 0) + 1;
        }
      });
      const classData = Object.keys(classMap).map(key => ({
        class: `Class ${key}`,
        count: classMap[key]
      }));
      setClassDistribution(classData);

      // Prepare attendance data for chart
      const attendanceReport = attendanceRes.data.data || [];
      const chartData = attendanceReport.slice(0, 10).map(item => ({
        name: item.full_name || 'Student',
        present: item.present_days || 0,
        absent: item.absent_days || 0
      }));

      setStats({
        totalStudents: students.length,
        activeStudents: activeStudents.length,
        deletedStudents: deletedStudents.length,
        todayAttendance: attendanceReport.filter(a => a.attendance_percentage >= 75).length,
        totalNotices: noticesRes.data.data?.length || 0,
        recentActivities: logsRes.data.data || []
      });

      setAttendanceData(chartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: FiUsers,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Active Students',
      value: stats.activeStudents,
      icon: FiUserCheck,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      title: 'Deleted Students',
      value: stats.deletedStudents,
      icon: FiUserX,
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      borderColor: 'border-red-200'
    },
    {
      title: "Today's Attendance",
      value: stats.todayAttendance,
      icon: FiCalendar,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    }
  ];

  const quickActions = [
    { icon: FiPlus, label: 'Add Student', path: '/teacher/add-student', color: 'bg-green-500', desc: 'Register new student' },
    { icon: FiSearch, label: 'Search Student', path: '/teacher/search', color: 'bg-blue-500', desc: 'Find student details' },
    { icon: FiCalendar, label: 'Mark Attendance', path: '/teacher/attendance', color: 'bg-purple-500', desc: 'Today\'s attendance' },
    { icon: FiFileText, label: 'Add Result', path: '/teacher/results', color: 'bg-orange-500', desc: 'Record student results' }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-secondary-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-card p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-blue-100 text-sm">{greeting} 👋</p>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Teacher'}!
            </h1>
            <p className="text-blue-100 mt-1">
              Here's what's happening with your students today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm flex items-center gap-1">
              <FiClock className="w-3 h-3" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <span className="px-3 py-1 bg-green-500 rounded-full text-sm flex items-center gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Online
            </span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className={`stat-card border-l-4 ${stat.borderColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500">{stat.title}</p>
                <p className="text-2xl font-bold text-secondary-900 mt-1">{stat.value}</p>
              </div>
              <div className={`stat-icon ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.path}
            className="bg-white rounded-xl shadow-card p-4 hover:shadow-hover transition-all duration-300 border border-secondary-100 text-center group"
          >
            <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-medium text-secondary-900">{action.label}</p>
            <p className="text-xs text-secondary-400 mt-1">{action.desc}</p>
          </Link>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
              <FiBarChart2 className="w-5 h-5 text-primary-600" />
              Attendance Overview
            </h3>
            <span className="text-xs text-secondary-400">Last 30 days</span>
          </div>
          <div className="h-64">
            {attendanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-secondary-400">
                <p>No attendance data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Class Distribution */}
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
              <FiBookOpen className="w-5 h-5 text-purple-600" />
              Class Distribution
            </h3>
            <span className="text-xs text-secondary-400">{stats.totalStudents} total</span>
          </div>
          <div className="h-64">
            {classDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="count"
                    label={({ class: cls }) => cls}
                  >
                    {classDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-secondary-400">
                <p>No class data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
              <FiActivity className="w-5 h-5 text-orange-600" />
              Recent Activities
            </h3>
            <Link to="/teacher/activity-logs" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <FiChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xs font-bold flex-shrink-0">
                    {activity.action?.charAt(0) || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900">
                      {activity.action || 'Activity'}
                    </p>
                    <p className="text-xs text-secondary-500 truncate">
                      {activity.details ? JSON.stringify(activity.details).substring(0, 60) : ''}
                    </p>
                    <p className="text-xs text-secondary-400 mt-1 flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-secondary-400">
                <FiActivity className="w-12 h-12 text-secondary-300 mx-auto mb-2" />
                <p>No recent activities</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
          <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2 mb-4">
            <FiTrendingUp className="w-5 h-5 text-green-600" />
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                <FiUsers className="w-4 h-4" />
                <span className="text-xs font-medium">Total</span>
              </div>
              <p className="text-2xl font-bold text-secondary-900">{stats.totalStudents}</p>
              <p className="text-xs text-secondary-500">Students</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                <FiUserCheck className="w-4 h-4" />
                <span className="text-xs font-medium">Active</span>
              </div>
              <p className="text-2xl font-bold text-secondary-900">{stats.activeStudents}</p>
              <p className="text-xs text-secondary-500">Students</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                <FiCalendar className="w-4 h-4" />
                <span className="text-xs font-medium">Today</span>
              </div>
              <p className="text-2xl font-bold text-secondary-900">{stats.todayAttendance}</p>
              <p className="text-xs text-secondary-500">Present</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                <FiBell className="w-4 h-4" />
                <span className="text-xs font-medium">Notices</span>
              </div>
              <p className="text-2xl font-bold text-secondary-900">{stats.totalNotices}</p>
              <p className="text-xs text-secondary-500">Published</p>
            </div>
          </div>
          
          {/* Teacher info */}
          <div className="mt-4 p-3 bg-secondary-50 rounded-lg">
            <p className="text-xs text-secondary-500">Logged in as</p>
            <p className="text-sm font-medium text-secondary-900">{user?.full_name || 'Teacher'}</p>
            <p className="text-xs text-secondary-400">ID: {user?.teacher_id || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherHome;