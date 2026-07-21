import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { 
  FiUser, 
  FiCalendar, 
  FiBarChart2, 
  FiBookOpen,
  FiAward,
  FiTrendingUp,
  FiBell,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronRight,
  FiUsers,
  FiMapPin,
  FiPhone
} from 'react-icons/fi';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

const StudentHome = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    student: null,
    attendance: { total_days: 0, present_days: 0, absent_days: 0 },
    attendance_percentage: 0,
    results: [],
    percentage: 0,
    subject_results: {},
    recent_notices: []
  });
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const admissionNumber = user?.admission_number || user?.id;
      
      const response = await api.get(`/api/students/dashboard/${admissionNumber}`);
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const attendancePercentage = dashboardData.attendance_percentage || 0;
  const overallPercentage = dashboardData.percentage || 0;

  const attendancePieData = [
    { name: 'Present', value: dashboardData.attendance?.present_days || 0 },
    { name: 'Absent', value: dashboardData.attendance?.absent_days || 0 }
  ];

  const subjectData = Object.entries(dashboardData.subject_results || {}).map(([subject, data]) => ({
    subject,
    average: data.reduce((sum, d) => sum + (d.marks / d.total_marks) * 100, 0) / data.length
  }));

  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b'];

  const statCards = [
    {
      title: 'Attendance',
      value: `${attendancePercentage}%`,
      icon: FiCalendar,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      subtitle: `${dashboardData.attendance?.present_days || 0}/${dashboardData.attendance?.total_days || 0} days`
    },
    {
      title: 'Overall Performance',
      value: `${overallPercentage}%`,
      icon: FiTrendingUp,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      subtitle: `${dashboardData.results?.length || 0} subjects`
    },
    {
      title: 'Total Subjects',
      value: dashboardData.results?.length || 0,
      icon: FiBookOpen,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      subtitle: 'Subjects enrolled'
    }
  ];

  const getGradeColor = (grade) => {
    switch(grade) {
      case 'A+':
      case 'A': return 'text-green-600';
      case 'B': return 'text-blue-600';
      case 'C': return 'text-yellow-600';
      default: return 'text-red-600';
    }
  };

  const getAttendanceStatus = () => {
    if (attendancePercentage >= 75) return { text: 'Excellent', color: 'text-green-600', emoji: '🌟' };
    if (attendancePercentage >= 60) return { text: 'Good', color: 'text-blue-600', emoji: '👍' };
    if (attendancePercentage >= 40) return { text: 'Average', color: 'text-yellow-600', emoji: '📚' };
    return { text: 'Needs Improvement', color: 'text-red-600', emoji: '💪' };
  };

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

  const attendanceStatus = getAttendanceStatus();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-card p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-blue-100 text-sm">{greeting} 👋</p>
            <h1 className="text-2xl font-bold">
              Welcome back, {dashboardData.student?.full_name?.split(' ')[0] || 'Student'}!
            </h1>
            <p className="text-blue-100 mt-1 flex items-center gap-2">
              <span>Class {dashboardData.student?.class || 'N/A'}</span>
              <span className="w-1 h-1 bg-blue-300 rounded-full"></span>
              <span>Admission: {dashboardData.student?.admission_number || 'N/A'}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm flex items-center gap-1">
              <FiClock className="w-3 h-3" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <span className="px-3 py-1 bg-green-500 rounded-full text-sm flex items-center gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Student
            </span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card border-l-4 border-l-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500">{stat.title}</p>
                <p className="text-2xl font-bold text-secondary-900 mt-1">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs text-secondary-400 mt-1">{stat.subtitle}</p>
                )}
              </div>
              <div className={`stat-icon ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance Status */}
      <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{attendanceStatus.emoji}</span>
          <div>
            <p className="text-sm text-secondary-500">Attendance Status</p>
            <p className={`text-lg font-bold ${attendanceStatus.color}`}>
              {attendanceStatus.text}
            </p>
          </div>
        </div>
        <div className="w-32 h-2 bg-secondary-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              attendancePercentage >= 75 ? 'bg-green-500' :
              attendancePercentage >= 60 ? 'bg-blue-500' :
              attendancePercentage >= 40 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${attendancePercentage}%` }}
          />
        </div>
        <span className="text-sm font-medium text-secondary-600">{attendancePercentage}%</span>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Pie Chart */}
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
            <FiCalendar className="w-5 h-5 text-primary-600" />
            Attendance Summary
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendancePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {attendancePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Performance */}
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
            <FiBarChart2 className="w-5 h-5 text-purple-600" />
            Subject Performance
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="subject" type="category" width={80} />
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                <Bar dataKey="average" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Results */}
      {dashboardData.results?.length > 0 && (
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
              <FiAward className="w-5 h-5 text-yellow-600" />
              Recent Results
            </h3>
            <Link to="/student/results" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <FiChevronRight className="w-4 h-4" />
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
                {dashboardData.results.slice(0, 5).map((result, index) => {
                  const percentage = ((result.marks / result.total_marks) * 100).toFixed(1);
                  return (
                    <tr key={index} className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50 transition-colors">
                      <td className="py-2 text-sm text-secondary-900 font-medium">{result.subject}</td>
                      <td className="py-2 text-sm text-secondary-900">{result.marks}</td>
                      <td className="py-2 text-sm text-secondary-900">{result.total_marks}</td>
                      <td className="py-2 text-sm text-secondary-900">{percentage}%</td>
                      <td className="py-2 text-sm">
                        <span className={`font-bold ${getGradeColor(result.grade)}`}>
                          {result.grade || 'N/A'}
                        </span>
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

      {/* Recent Notices */}
      {dashboardData.recent_notices?.length > 0 && (
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
              <FiBell className="w-5 h-5 text-orange-600" />
              Recent Notices
            </h3>
            <Link to="/student/notices" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <FiChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {dashboardData.recent_notices.slice(0, 3).map((notice, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 flex-shrink-0">
                  <FiBell className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-secondary-900">{notice.title}</p>
                  <p className="text-xs text-secondary-500 line-clamp-1">{notice.content}</p>
                  <p className="text-xs text-secondary-400 mt-1 flex items-center gap-1">
                    <FiClock className="w-3 h-3" />
                    {new Date(notice.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHome;