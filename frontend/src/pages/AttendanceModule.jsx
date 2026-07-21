import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiCalendar,
  FiUsers,
  FiCheck,
  FiX,
  FiClock,
  FiSearch,
  FiRefreshCw,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiTrendingUp,
  FiUserCheck,
  FiUserX,
  FiUser,
  FiInfo,
  FiFilter,
  FiSave
} from 'react-icons/fi';

const AttendanceModule = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [classFilter, setClassFilter] = useState('all');
  const [attendanceStats, setAttendanceStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0
  });
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    updateStats();
  }, [attendance, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/students');
      
      if (response.data.success) {
        const studentList = response.data.data || [];
        setStudents(studentList);
        
        // Initialize attendance for all students
        const initialAttendance = {};
        studentList.forEach(student => {
          initialAttendance[student.admission_number] = 'present';
        });
        setAttendance(initialAttendance);
      }
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const updateStats = () => {
    const stats = {
      total: students.length,
      present: 0,
      absent: 0,
      late: 0
    };
    
    Object.values(attendance).forEach(status => {
      if (status === 'present') stats.present++;
      else if (status === 'absent') stats.absent++;
      else if (status === 'late') stats.late++;
    });
    
    setAttendanceStats(stats);
  };

  const handleAttendanceChange = (admissionNumber, status) => {
    setAttendance(prev => ({
      ...prev,
      [admissionNumber]: status
    }));
  };

  const handleMarkAll = (status) => {
    const newAttendance = {};
    filteredStudents.forEach(student => {
      newAttendance[student.admission_number] = status;
    });
    setAttendance(prev => ({
      ...prev,
      ...newAttendance
    }));
    toast.success(`Marked all as ${status}`);
  };

  const handleSubmitAttendance = async () => {
    try {
      setLoading(true);
      
      const attendanceData = Object.entries(attendance).map(([admissionNumber, status]) => ({
        admission_number: parseInt(admissionNumber),
        date: selectedDate,
        status
      }));

      const response = await api.post('/api/attendance/bulk', {
        attendance_data: attendanceData
      });

      if (response.data.success) {
        toast.success(`Attendance marked for ${response.data.total} students on ${new Date(selectedDate).toLocaleDateString()}`);
      }
    } catch (error) {
      toast.error('Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleExportAttendance = () => {
    try {
      const exportData = filteredStudents.map(student => ({
        'Admission No': student.admission_number,
        'Student Name': student.full_name,
        'Class': student.class || 'N/A',
        'Status': attendance[student.admission_number] || 'absent'
      }));

      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${selectedDate}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Attendance exported successfully');
    } catch (error) {
      toast.error('Failed to export attendance');
    }
  };

  const getUniqueClasses = () => {
    const classes = ['all', ...new Set(students.map(s => s.class).filter(Boolean))];
    return classes;
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.admission_number?.toString().includes(searchTerm);
    const matchesClass = classFilter === 'all' || student.class === classFilter;
    return matchesSearch && matchesClass;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const getStatusCounts = () => {
    const counts = { present: 0, absent: 0, late: 0 };
    Object.values(attendance).forEach(status => {
      if (counts[status] !== undefined) counts[status]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  const statusOptions = [
    { value: 'present', label: 'Present', color: 'bg-green-500', hoverColor: 'hover:bg-green-600', icon: FiCheck },
    { value: 'absent', label: 'Absent', color: 'bg-red-500', hoverColor: 'hover:bg-red-600', icon: FiX },
    { value: 'late', label: 'Late', color: 'bg-yellow-500', hoverColor: 'hover:bg-yellow-600', icon: FiClock }
  ];

  if (loading && students.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-secondary-500 text-sm">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
            <FiCalendar className="w-6 h-6 text-primary-600" />
            Manage Attendance
          </h1>
          <p className="text-secondary-500 text-sm mt-1">
            {students.length} students • {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportAttendance}
            className="btn-secondary flex items-center gap-2"
          >
            <FiDownload className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleSubmitAttendance}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FiSave className="w-4 h-4" />
            )}
            Save Attendance
          </button>
          <button
            onClick={fetchStudents}
            className="btn-secondary flex items-center gap-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {showStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <FiUsers className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-secondary-900">{attendanceStats.total}</p>
            <p className="text-xs text-secondary-500">Total Students</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <FiUserCheck className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{attendanceStats.present}</p>
            <p className="text-xs text-secondary-500">Present</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <FiUserX className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
            <p className="text-xs text-secondary-500">Absent</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <FiClock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</p>
            <p className="text-xs text-secondary-500">Late</p>
          </div>
        </div>
      )}

      {/* Date Picker & Quick Actions */}
      <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="input-label flex items-center gap-1">
              <FiCalendar className="w-4 h-4" />
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="input-field"
            />
          </div>
          <div className="flex-1">
            <label className="input-label">Quick Actions</label>
            <div className="flex gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleMarkAll(option.value)}
                  className={`flex-1 px-3 py-2 ${option.color} text-white rounded-lg hover:opacity-80 transition-colors text-sm font-medium flex items-center justify-center gap-1`}
                >
                  <option.icon className="w-4 h-4" />
                  All {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or admission number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="input-field"
            >
              {getUniqueClasses().map(cls => (
                <option key={cls} value={cls}>
                  {cls === 'all' ? 'All Classes' : `Class ${cls}`}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowStats(!showStats)}
            className="btn-secondary flex items-center gap-2 whitespace-nowrap"
          >
            <FiTrendingUp className="w-4 h-4" />
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </button>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-xl shadow-card border border-secondary-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary-50 border-b border-secondary-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Admission</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Student Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Class</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {currentItems.map((student, index) => (
                <tr key={student.admission_number} className="hover:bg-secondary-50 transition-colors group">
                  <td className="px-4 py-3 text-sm text-secondary-400">
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-secondary-900">
                    {student.admission_number}
                  </td>
                  <td className="px-4 py-3 text-sm text-secondary-900">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xs font-bold">
                        {student.full_name?.charAt(0) || 'S'}
                      </div>
                      {student.full_name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-secondary-600">
                    <span className="px-2 py-0.5 bg-secondary-100 rounded-full text-xs">
                      Class {student.class || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleAttendanceChange(student.admission_number, option.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                            attendance[student.admission_number] === option.value
                              ? `${option.color} text-white shadow-md scale-105`
                              : 'bg-secondary-100 text-secondary-500 hover:bg-secondary-200'
                          }`}
                        >
                          <option.icon className="w-3 h-3" />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center text-secondary-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-300">
                        <FiUsers className="w-8 h-8" />
                      </div>
                      <p className="text-base">No students found</p>
                      {(searchTerm || classFilter !== 'all') && (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setClassFilter('all');
                          }}
                          className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-secondary-200">
            <p className="text-sm text-secondary-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length} students
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-secondary-200 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-secondary-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-secondary-200 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-secondary-500 bg-white rounded-xl shadow-card p-3 border border-secondary-100">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Present
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          Absent
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
          Late
        </span>
        <span className="text-secondary-300">|</span>
        <span className="text-secondary-400">Click on status buttons to mark attendance</span>
      </div>
    </div>
  );
};

export default AttendanceModule;