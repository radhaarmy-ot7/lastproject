import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FiSearch, 
  FiEdit, 
  FiTrash2, 
  FiRefreshCw, 
  FiUser,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiFileText,
  FiDownload,
  FiFilter,
  FiUserCheck,
  FiUserX,
  FiEye,
  FiRotateCcw
} from 'react-icons/fi';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDeleted, setShowDeleted] = useState(false);
  const [classFilter, setClassFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, active: 0, deleted: 0 });

  useEffect(() => {
    fetchStudents();
  }, [showDeleted]);

  useEffect(() => {
    calculateStats();
  }, [students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const endpoint = showDeleted ? '/api/students/deleted/all' : '/api/students';
      const response = await api.get(endpoint);
      
      if (response.data.success) {
        setStudents(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = students.length;
    const active = students.filter(s => !s.is_deleted).length;
    const deleted = students.filter(s => s.is_deleted).length;
    setStats({ total, active, deleted });
  };

  const handleDelete = async (admissionNumber, fullName) => {
    if (!window.confirm(`Are you sure you want to delete ${fullName}?`)) return;

    try {
      const response = await api.delete(`/api/students/${admissionNumber}`);
      
      if (response.data.success) {
        toast.success(`${fullName} deleted successfully`);
        fetchStudents();
      }
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const handleRestore = async (admissionNumber, fullName) => {
    if (!window.confirm(`Are you sure you want to restore ${fullName}?`)) return;

    try {
      const response = await api.put(`/api/students/restore/${admissionNumber}`);
      
      if (response.data.success) {
        toast.success(`${fullName} restored successfully`);
        fetchStudents();
      }
    } catch (error) {
      toast.error('Failed to restore student');
    }
  };

  const handleExport = () => {
    try {
      const exportData = filteredStudents.map(student => ({
        'Admission No': student.admission_number,
        'Student Name': student.full_name,
        'Class': student.class || 'N/A',
        "Father's Name": student.father_name || 'N/A',
        "Mother's Name": student.mother_name || 'N/A',
        'Phone': student.phone_number || 'N/A',
        'Status': student.is_deleted ? 'Deleted' : 'Active',
        'Joining Date': student.joining_date || 'N/A'
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
      a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Students exported successfully');
    } catch (error) {
      toast.error('Failed to export students');
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

  const getStatusBadge = (student) => {
    if (student.is_deleted) {
      return <span className="badge badge-danger">Deleted</span>;
    }
    return <span className="badge badge-success">Active</span>;
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
            <FiUsers className="w-6 h-6 text-primary-600" />
            {showDeleted ? 'Deleted Students' : 'All Students'}
          </h1>
          <p className="text-secondary-500 text-sm mt-1 flex items-center gap-3">
            <span>Total: {stats.total} students</span>
            <span className="text-green-600">● {stats.active} Active</span>
            <span className="text-red-600">● {stats.deleted} Deleted</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center gap-2"
          >
            <FiDownload className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              showDeleted 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
            }`}
          >
            {showDeleted ? <FiUserCheck className="w-4 h-4" /> : <FiUserX className="w-4 h-4" />}
            {showDeleted ? 'Show Active' : 'Show Deleted'}
          </button>
          <Link
            to="/teacher/add-student"
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            Add Student
          </Link>
          <button
            onClick={fetchStudents}
            className="btn-secondary flex items-center gap-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filter */}
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
          {(searchTerm || classFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setClassFilter('all');
              }}
              className="btn-secondary whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl shadow-card border border-secondary-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary-50 border-b border-secondary-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Admission</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Student Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Class</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Father</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {currentItems.length > 0 ? (
                currentItems.map((student, index) => (
                  <tr key={student.admission_number} className="hover:bg-secondary-50 transition-colors group">
                    <td className="px-4 py-3 text-sm text-secondary-400">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-secondary-900">
                      #{student.admission_number}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xs font-bold">
                          {student.full_name?.charAt(0) || 'S'}
                        </div>
                        <span className="text-sm text-secondary-900 font-medium">
                          {student.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary-600">
                      <span className="px-2 py-0.5 bg-secondary-100 rounded-full text-xs">
                        Class {student.class || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary-600">
                      {student.father_name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary-600">
                      {student.phone_number || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(student)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/teacher/search?admission=${student.admission_number}`}
                          className="p-1.5 text-secondary-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50"
                          title="View Details"
                        >
                          <FiEye className="w-4 h-4" />
                        </Link>
                        {!student.is_deleted ? (
                          <>
                            <Link
                              to={`/teacher/search?admission=${student.admission_number}&edit=true`}
                              className="p-1.5 text-secondary-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                              title="Edit"
                            >
                              <FiEdit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(student.admission_number, student.full_name)}
                              className="p-1.5 text-secondary-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRestore(student.admission_number, student.full_name)}
                            className="p-1.5 text-secondary-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                            title="Restore"
                          >
                            <FiRotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-secondary-500">
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
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          Clear filters
                        </button>
                      )}
                      {!searchTerm && classFilter === 'all' && !showDeleted && (
                        <Link
                          to="/teacher/add-student"
                          className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                        >
                          <FiPlus className="w-4 h-4" />
                          Add your first student
                        </Link>
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

      {/* Quick Stats Footer */}
      <div className="flex items-center justify-between text-xs text-secondary-400 bg-white rounded-xl shadow-card p-3 border border-secondary-100">
        <span>Total Students: {stats.total}</span>
        <span>Active: {stats.active}</span>
        <span>Deleted: {stats.deleted}</span>
        <span>Showing: {filteredStudents.length} filtered</span>
      </div>
    </div>
  );
};

export default StudentList;