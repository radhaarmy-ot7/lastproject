import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiRefreshCw,
  FiBarChart2,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiAward,
  FiTrendingUp,
  FiInfo,
  FiX
} from 'react-icons/fi';

const ResultsModule = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editResultId, setEditResultId] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const [formData, setFormData] = useState({
    admission_number: '',
    subject: '',
    marks: '',
    total_marks: '',
    grade: '',
    exam_type: '',
    exam_date: new Date().toISOString().split('T')[0]
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    average: 0,
    highest: 0,
    lowest: 0,
    gradeDistribution: {}
  });

  const examTypes = ['Mid Term', 'Final', 'Quiz', 'Assignment', 'Practical'];
  const grades = ['A+', 'A', 'B', 'C', 'D', 'F'];

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (results.length > 0) {
      calculateStatistics();
    }
  }, [results]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/students');
      
      if (response.data.success) {
        setStudents(response.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (admissionNumber) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/results/student/${admissionNumber}`);
      
      if (response.data.success) {
        setResults(response.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = () => {
    const marks = results.map(r => r.marks);
    const total = marks.length;
    const average = total > 0 ? marks.reduce((a, b) => a + b, 0) / total : 0;
    const highest = total > 0 ? Math.max(...marks) : 0;
    const lowest = total > 0 ? Math.min(...marks) : 0;
    
    const gradeDist = {};
    results.forEach(r => {
      const grade = r.grade || 'N/A';
      gradeDist[grade] = (gradeDist[grade] || 0) + 1;
    });

    setStatistics({
      total,
      average: parseFloat(average.toFixed(1)),
      highest,
      lowest,
      gradeDistribution: gradeDist
    });
  };

  const handleStudentSelect = (admissionNumber) => {
    const student = students.find(s => s.admission_number === parseInt(admissionNumber));
    setSelectedStudent(student);
    if (student) {
      fetchResults(student.admission_number);
      setFormData(prev => ({ ...prev, admission_number: student.admission_number }));
    }
  };

  const handleAddResult = () => {
    setShowAddForm(true);
    setEditResultId(null);
    setFormData({
      admission_number: selectedStudent?.admission_number || '',
      subject: '',
      marks: '',
      total_marks: '',
      grade: '',
      exam_type: '',
      exam_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleEditResult = (result) => {
    setShowAddForm(true);
    setEditResultId(result.id);
    setFormData({
      admission_number: result.admission_number,
      subject: result.subject,
      marks: result.marks,
      total_marks: result.total_marks,
      grade: result.grade,
      exam_type: result.exam_type,
      exam_date: result.exam_date.split('T')[0]
    });
  };

  const handleDeleteResult = async (resultId) => {
    if (!window.confirm('Are you sure you want to delete this result?')) return;

    try {
      const response = await api.delete(`/api/results/${resultId}`);
      
      if (response.data.success) {
        toast.success('Result deleted successfully');
        if (selectedStudent) {
          fetchResults(selectedStudent.admission_number);
        }
      }
    } catch (error) {
      toast.error('Failed to delete result');
    }
  };

  const handleSubmitResult = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate marks
      if (parseFloat(formData.marks) > parseFloat(formData.total_marks)) {
        toast.error('Marks cannot exceed total marks');
        return;
      }
      
      // Calculate grade if not provided
      let grade = formData.grade;
      if (!grade) {
        const percentage = (parseFloat(formData.marks) / parseFloat(formData.total_marks)) * 100;
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B';
        else if (percentage >= 60) grade = 'C';
        else if (percentage >= 50) grade = 'D';
        else grade = 'F';
      }

      const payload = {
        ...formData,
        marks: parseFloat(formData.marks),
        total_marks: parseFloat(formData.total_marks),
        grade
      };

      let response;
      if (editResultId) {
        response = await api.put(`/api/results/${editResultId}`, payload);
      } else {
        response = await api.post('/api/results', payload);
      }

      if (response.data.success) {
        toast.success(editResultId ? 'Result updated successfully' : 'Result added successfully');
        setShowAddForm(false);
        if (selectedStudent) {
          fetchResults(selectedStudent.admission_number);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save result');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExportResults = () => {
    try {
      const exportData = results.map(result => ({
        'Subject': result.subject,
        'Marks': result.marks,
        'Total': result.total_marks,
        'Percentage': ((result.marks / result.total_marks) * 100).toFixed(1) + '%',
        'Grade': result.grade || 'N/A',
        'Exam Type': result.exam_type || 'N/A',
        'Date': result.exam_date ? new Date(result.exam_date).toLocaleDateString() : 'N/A'
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
      a.download = `results_${selectedStudent?.admission_number}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Results exported successfully');
    } catch (error) {
      toast.error('Failed to export results');
    }
  };

  const filteredStudents = students.filter(student =>
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admission_number?.toString().includes(searchTerm)
  );

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

  const getGradeEmoji = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A': return '🌟';
      case 'B': return '👍';
      case 'C': return '📚';
      case 'D': return '📖';
      default: return '💪';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
            <FiBarChart2 className="w-6 h-6 text-primary-600" />
            Manage Results
          </h1>
          <p className="text-secondary-500 text-sm mt-1">
            Add and manage student results
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedStudent && results.length > 0 && (
            <button
              onClick={handleExportResults}
              className="btn-secondary flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Export
            </button>
          )}
          {selectedStudent && (
            <button
              onClick={handleAddResult}
              className="btn-primary flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Add Result
            </button>
          )}
          <button
            onClick={fetchStudents}
            className="btn-secondary flex items-center gap-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Student Selection */}
      <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="input-label flex items-center gap-1">
              <FiSearch className="w-4 h-4" />
              Search Student
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or admission number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="sm:w-56">
            <label className="input-label">Select Student</label>
            <select
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="input-field"
              value={selectedStudent?.admission_number || ''}
            >
              <option value="">Select a student</option>
              {filteredStudents.map(student => (
                <option key={student.admission_number} value={student.admission_number}>
                  {student.admission_number} - {student.full_name}
                </option>
              ))}
            </select>
          </div>
          {selectedStudent && (
            <div className="sm:w-32 flex items-end">
              <button
                onClick={() => setShowStats(!showStats)}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <FiTrendingUp className="w-4 h-4" />
                {showStats ? 'Hide Stats' : 'Show Stats'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {selectedStudent && showStats && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <FiBarChart2 className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-secondary-900">{statistics.total}</p>
            <p className="text-xs text-secondary-500">Total Results</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <FiTrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{statistics.average}</p>
            <p className="text-xs text-secondary-500">Average Marks</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <FiAward className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">{statistics.highest}</p>
            <p className="text-xs text-secondary-500">Highest Marks</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <FiInfo className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{statistics.lowest}</p>
            <p className="text-xs text-secondary-500">Lowest Marks</p>
          </div>
        </div>
      )}

      {/* Add/Edit Result Form */}
      {showAddForm && selectedStudent && (
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
              <FiBookOpen className="w-5 h-5 text-primary-600" />
              {editResultId ? 'Edit Result' : 'Add New Result'}
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-secondary-400 hover:text-secondary-600 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmitResult} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Subject *</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="e.g., Mathematics"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="input-label">Exam Type *</label>
              <select
                name="exam_type"
                value={formData.exam_type}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Select exam type</option>
                {examTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Marks Obtained *</label>
              <input
                type="number"
                name="marks"
                value={formData.marks}
                onChange={handleInputChange}
                placeholder="e.g., 85"
                className="input-field"
                required
                min="0"
                step="0.5"
              />
            </div>
            <div>
              <label className="input-label">Total Marks *</label>
              <input
                type="number"
                name="total_marks"
                value={formData.total_marks}
                onChange={handleInputChange}
                placeholder="e.g., 100"
                className="input-field"
                required
                min="1"
                step="0.5"
              />
            </div>
            <div>
              <label className="input-label">Grade (Optional)</label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Auto-calculate</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Exam Date *</label>
              <input
                type="date"
                name="exam_date"
                value={formData.exam_date}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            <div className="md:col-span-2 flex gap-2 pt-2 border-t border-secondary-100">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-6"
              >
                {loading ? 'Saving...' : (editResultId ? 'Update Result' : 'Add Result')}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Results List */}
      {selectedStudent && (
        <div className="bg-white rounded-xl shadow-card border border-secondary-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-secondary-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
                <FiAward className="w-5 h-5 text-yellow-600" />
                Results for {selectedStudent.full_name}
              </h3>
              <p className="text-sm text-secondary-500">Admission: {selectedStudent.admission_number}</p>
            </div>
            <div className="text-sm text-secondary-400">
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary-50 border-b border-secondary-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Marks</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Percentage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Grade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Exam Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {results.map((result, index) => {
                  const percentage = ((result.marks / result.total_marks) * 100).toFixed(1);
                  return (
                    <tr key={result.id} className="hover:bg-secondary-50 transition-colors group">
                      <td className="px-4 py-3 text-sm text-secondary-400">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-secondary-900">
                        {result.subject}
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary-900 font-medium">
                        {result.marks}
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary-900">
                        {result.total_marks}
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary-900">
                        {percentage}%
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span>{getGradeEmoji(result.grade)}</span>
                          <span className={`badge ${getGradeColor(result.grade)}`}>
                            {result.grade || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary-600">
                        <span className="px-2 py-0.5 bg-secondary-100 rounded-full text-xs">
                          {result.exam_type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditResult(result)}
                            className="p-1.5 text-secondary-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                            title="Edit"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteResult(result.id)}
                            className="p-1.5 text-secondary-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {results.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center text-secondary-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-300">
                          <FiBarChart2 className="w-8 h-8" />
                        </div>
                        <p className="text-base">No results found for this student</p>
                        <button
                          onClick={handleAddResult}
                          className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                        >
                          <FiPlus className="w-4 h-4" />
                          Add first result
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!selectedStudent && (
        <div className="bg-white rounded-xl shadow-card p-12 border border-secondary-100 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-400 text-4xl">
              <FiBarChart2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-medium text-secondary-900">Select a Student</h3>
            <p className="text-secondary-500 max-w-sm">
              Search and select a student from the dropdown above to view and manage their results
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsModule;