import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiCalendar,
  FiCheck,
  FiX,
  FiClock,
  FiTrendingUp,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

const StudentAttendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState({ total_days: 0, present_days: 0, absent_days: 0 });
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    fetchAttendance();
  }, [user, currentMonth, currentYear]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const admissionNumber = user?.admission_number || user?.id;
      
      const summaryRes = await api.get(`/api/attendance/summary/${admissionNumber}`);
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.data);
        setAttendancePercentage(summaryRes.data.data.percentage || 0);
      }

      const monthlyRes = await api.get(`/api/attendance/monthly/${admissionNumber}?month=${currentMonth}&year=${currentYear}`);
      if (monthlyRes.data.success) {
        const data = monthlyRes.data.data.data || [];
        setMonthlyData(data);
        
        // Calculate weekly data
        calculateWeeklyData(data);
      }
    } catch (error) {
      toast.error('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const calculateWeeklyData = (data) => {
    const weeks = {};
    data.forEach(record => {
      const date = new Date(record.date);
      const week = Math.ceil(date.getDate() / 7);
      const weekKey = `Week ${week}`;
      if (!weeks[weekKey]) {
        weeks[weekKey] = { present: 0, absent: 0, late: 0 };
      }
      if (record.status === 'present') weeks[weekKey].present++;
      else if (record.status === 'absent') weeks[weekKey].absent++;
      else if (record.status === 'late') weeks[weekKey].late++;
    });
    
    const weeklyArray = Object.keys(weeks).map(key => ({
      week: key,
      ...weeks[key]
    }));
    setWeeklyData(weeklyArray);
  };

  const changeMonth = (delta) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'present': return <FiCheck className="w-4 h-4 text-green-600" />;
      case 'absent': return <FiX className="w-4 h-4 text-red-600" />;
      case 'late': return <FiClock className="w-4 h-4 text-yellow-600" />;
      default: return null;
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800'
    };
    return `badge ${classes[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const pieData = [
    { name: 'Present', value: summary.present_days || 0 },
    { name: 'Absent', value: summary.absent_days || 0 },
    { name: 'Late', value: summary.late_days || 0 }
  ];

  const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">My Attendance</h1>
            <p className="text-secondary-500 text-sm mt-1">Track your attendance performance</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-center px-3 py-2 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-primary-600">{attendancePercentage}%</p>
              <p className="text-xs text-secondary-500">Attendance Rate</p>
            </div>
            <div className="text-center px-3 py-2 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{summary.present_days || 0}</p>
              <p className="text-xs text-secondary-500">Present</p>
            </div>
            <div className="text-center px-3 py-2 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{summary.absent_days || 0}</p>
              <p className="text-xs text-secondary-500">Absent</p>
            </div>
            {summary.late_days > 0 && (
              <div className="text-center px-3 py-2 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{summary.late_days || 0}</p>
                <p className="text-xs text-secondary-500">Late</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Attendance Summary</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Bar Chart */}
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Weekly Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#10b981" />
                <Bar dataKey="absent" fill="#ef4444" />
                <Bar dataKey="late" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Calendar View */}
      <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900">Monthly Calendar</h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => changeMonth(-1)} 
              className="p-2 rounded-lg border border-secondary-200 hover:bg-secondary-50 transition-colors"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-secondary-700 min-w-[120px] text-center">
              {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })} {currentYear}
            </span>
            <button 
              onClick={() => changeMonth(1)} 
              className="p-2 rounded-lg border border-secondary-200 hover:bg-secondary-50 transition-colors"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={fetchAttendance} 
              className="p-2 rounded-lg border border-secondary-200 hover:bg-secondary-50 transition-colors"
              title="Refresh"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-secondary-500 py-2 border-b border-secondary-100">
              {day}
            </div>
          ))}
          
          {Array.from({ length: new Date(currentYear, currentMonth - 1, 1).getDay() }, (_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}
          
          {Array.from({ length: new Date(currentYear, currentMonth, 0).getDate() }, (_, i) => {
            const day = i + 1;
            const record = monthlyData.find(a => {
              const d = new Date(a.date);
              return d.getDate() === day;
            });
            const status = record?.status || 'absent';
            
            return (
              <div 
                key={day} 
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  status === 'present' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                  status === 'late' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                  'bg-red-50 text-red-500 hover:bg-red-100'
                } cursor-pointer relative`}
              >
                <span>{day}</span>
                <span className="absolute -top-1 -right-1">
                  {getStatusIcon(status)}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-secondary-100">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-xs text-secondary-600">Present</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-50 border border-red-300 rounded"></div>
            <span className="text-xs text-secondary-600">Absent</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span className="text-xs text-secondary-600">Late</span>
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      {monthlyData.length > 0 && (
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Attendance Records</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left py-2 text-xs font-medium text-secondary-500 uppercase">Date</th>
                  <th className="text-left py-2 text-xs font-medium text-secondary-500 uppercase">Day</th>
                  <th className="text-left py-2 text-xs font-medium text-secondary-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.slice(0, 10).map((record, index) => (
                  <tr key={index} className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50 transition-colors">
                    <td className="py-2 text-sm text-secondary-900">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-2 text-sm text-secondary-600">
                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </td>
                    <td className="py-2">
                      <span className={getStatusBadge(record.status)}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {monthlyData.length > 10 && (
              <p className="text-xs text-secondary-400 text-center mt-2">
                Showing 10 of {monthlyData.length} records
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;