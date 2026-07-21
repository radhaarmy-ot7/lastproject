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
  FiChevronRight
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
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
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

      // Fetch recent activities (mock data for now)
      const activities = [
        { type: 'attendance', message: 'Attendance marked for today', time: '2 hours ago', icon: FiCalendar },
        { type: 'result', message: 'Math result published', time: '1 day ago', icon: FiBarChart2 },
        { type: 'notice', message: 'New notice from school', time: '2 days ago', icon: FiBell },
      ];
      setRecentActivities(activities);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-card p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {dashboardData.student?.full_name || 'Student'}! 👋
            </h1>
            <p className="text-blue-100 mt-1">
              Class {dashboardData.student?.class || 'N/A'} · Admission: {dashboardData.student?.admission_number || 'N/A'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Student</span>
            <span className="px-3 py-1 bg-green-500 rounded-full text-sm">Active</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card hover:shadow-hover transition-all">
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Pie Chart */}
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Attendance Summary</h3>
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
                  label
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
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Subject Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="subject" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="average" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activities & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">Recent Activities</h3>
            <span className="text-xs text-secondary-400">Last 7 days</span>
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 flex-shrink-0">
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-secondary-900">{activity.message}</p>
                  <p className="text-xs text-secondary-400">{activity.time}</p>
                </div>
                <FiChevronRight className="w-4 h-4 text-secondary-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Notices */}
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">Recent Notices</h3>
            <Link to="/student/notices" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {dashboardData.recent_notices?.length > 0 ? (
              dashboardData.recent_notices.slice(0, 3).map((notice, index) => (
                <div key={index} className="p-3 border border-secondary-100 rounded-lg hover:shadow-card transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 flex-shrink-0">
                      <FiBell className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-secondary-900">{notice.title}</p>
                      <p className="text-xs text-secondary-400 line-clamp-1">{notice.content}</p>
                      <p className="text-xs text-secondary-400 mt-1">
                        {new Date(notice.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-secondary-500">
                <FiBell className="w-12 h-12 text-secondary-300 mx-auto mb-2" />
                <p>No notices available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Results */}
      {dashboardData.results?.length > 0 && (
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">Recent Results</h3>
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
    </div>
  );
};

export default StudentHome;