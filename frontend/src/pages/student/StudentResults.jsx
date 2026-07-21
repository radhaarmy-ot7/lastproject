import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiBarChart2,
  FiBookOpen,
  FiAward,
  FiTrendingUp,
  FiChevronDown,
  FiChevronUp,
  FiDownload,
  FiPieChart,
  FiCalendar,
  FiInfo
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const StudentResults = () => {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [percentage, setPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedExamType, setSelectedExamType] = useState('all');
  const [examTypes, setExamTypes] = useState([]);
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [summary, setSummary] = useState({});
  const [gradeDistribution, setGradeDistribution] = useState([]);

  useEffect(() => {
    fetchResults();
  }, [user]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const admissionNumber = user?.admission_number || user?.id;
      
      const resultsRes = await api.get(`/api/results/student/${admissionNumber}`);
      if (resultsRes.data.success) {
        const allResults = resultsRes.data.data || [];
        setResults(allResults);
        const types = [...new Set(allResults.map(r => r.exam_type))];
        setExamTypes(types);
        
        // Calculate grade distribution
        const grades = {};
        allResults.forEach(r => {
          const grade = r.grade || 'N/A';
          grades[grade] = (grades[grade] || 0) + 1;
        });
        const gradeData = Object.keys(grades).map(key => ({
          grade: key,
          count: grades[key]
        }));
        setGradeDistribution(gradeData);
      }

      const summaryRes = await api.get(`/api/results/summary/${admissionNumber}`);
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.data);
        setPercentage(summaryRes.data.data.percentage || 0);
      }
    } catch (error) {
      toast.error('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubjectExpand = (subject) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subject]: !prev[subject]
    }));
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

  const getPerformanceText = (percentage) => {
    if (percentage >= 80) return { text: 'Excellent', color: 'text-green-600' };
    if (percentage >= 60) return { text: 'Good', color: 'text-blue-600' };
    if (percentage >= 40) return { text: 'Average', color: 'text-yellow-600' };
    return { text: 'Needs Improvement', color: 'text-red-600' };
  };

  const filteredResults = selectedExamType === 'all' 
    ? results 
    : results.filter(r => r.exam_type === selectedExamType);

  const subjectGroups = {};
  filteredResults.forEach(result => {
    if (!subjectGroups[result.subject]) {
      subjectGroups[result.subject] = [];
    }
    subjectGroups[result.subject].push(result);
  });

  const subjectAverages = Object.keys(subjectGroups).map(subject => {
    const subjectResults = subjectGroups[subject];
    const totalMarks = subjectResults.reduce((sum, r) => sum + r.marks, 0);
    const totalMaxMarks = subjectResults.reduce((sum, r) => sum + r.total_marks, 0);
    const avg = (totalMarks / totalMaxMarks) * 100;
    return {
      subject,
      average: avg,
      count: subjectResults.length,
      results: subjectResults
    };
  });

  const chartData = subjectAverages.map(item => ({
    subject: item.subject,
    percentage: parseFloat(item.average.toFixed(1))
  }));

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

  const performance = getPerformanceText(percentage);

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
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-card p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Results</h1>
            <p className="text-purple-100 text-sm mt-1">Track your academic performance</p>
          </div>
          <div className="flex items-center gap-6 bg-white/10 rounded-lg p-3">
            <div className="text-center">
              <p className="text-3xl font-bold">{percentage}%</p>
              <p className="text-xs text-purple-200">Overall Percentage</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{results.length}</p>
              <p className="text-xs text-purple-200">Total Results</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{subjectAverages.length}</p>
              <p className="text-xs text-purple-200">Subjects</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-purple-200">Performance:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${performance.color} bg-white/20`}>
            {performance.text}
          </span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance Bar Chart */}
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
            <FiBarChart2 className="w-5 h-5 text-primary-600" />
            Subject Performance
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="subject" type="category" width={80} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="percentage" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
            <FiPieChart className="w-5 h-5 text-purple-600" />
            Grade Distribution
          </h3>
          <div className="h-64">
            {gradeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="count"
                    label={({ grade }) => grade}
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-secondary-400">
                <p>No grade data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center">
          <p className="text-2xl font-bold text-primary-600">{summary.total_subjects || 0}</p>
          <p className="text-xs text-secondary-500">Total Subjects</p>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center">
          <p className="text-2xl font-bold text-green-600">
            {summary.average_marks ? parseFloat(summary.average_marks).toFixed(1) : 0}
          </p>
          <p className="text-xs text-secondary-500">Avg Marks</p>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center">
          <p className="text-2xl font-bold text-purple-600">{results.filter(r => r.grade === 'A+' || r.grade === 'A').length}</p>
          <p className="text-xs text-secondary-500">A+ / A Grades</p>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center">
          <p className="text-2xl font-bold text-yellow-600">{examTypes.length}</p>
          <p className="text-xs text-secondary-500">Exam Types</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100">
        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm font-medium text-secondary-700 flex items-center gap-2">
            <FiCalendar className="w-4 h-4" />
            Filter by Exam Type:
          </label>
          <select
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="all">All Exams</option>
            {examTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <span className="text-xs text-secondary-400 ml-auto">
            Showing {filteredResults.length} results
          </span>
        </div>
      </div>

      {/* Subject-wise Results */}
      <div className="space-y-4">
        {subjectAverages.map((subjectData) => (
          <div key={subjectData.subject} className="bg-white rounded-xl shadow-card border border-secondary-100 overflow-hidden hover:shadow-hover transition-all">
            <button
              onClick={() => toggleSubjectExpand(subjectData.subject)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                  <FiBookOpen className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="font-semibold text-secondary-900">{subjectData.subject}</span>
                  <span className="text-sm text-secondary-500 ml-2">
                    {subjectData.count} exam(s)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className={`text-lg font-bold ${
                    subjectData.average >= 70 ? 'text-green-600' :
                    subjectData.average >= 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {subjectData.average.toFixed(1)}%
                  </span>
                  <p className="text-xs text-secondary-400">
                    {subjectData.average >= 70 ? 'Good' :
                     subjectData.average >= 50 ? 'Average' : 'Needs Work'}
                  </p>
                </div>
                {expandedSubjects[subjectData.subject] ? (
                  <FiChevronUp className="w-5 h-5 text-secondary-400" />
                ) : (
                  <FiChevronDown className="w-5 h-5 text-secondary-400" />
                )}
              </div>
            </button>
            
            {expandedSubjects[subjectData.subject] && (
              <div className="px-6 pb-4 border-t border-secondary-100">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-secondary-50">
                        <th className="text-left py-2 px-3 text-xs font-medium text-secondary-500 uppercase">Exam Type</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-secondary-500 uppercase">Marks</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-secondary-500 uppercase">Total</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-secondary-500 uppercase">Percentage</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-secondary-500 uppercase">Grade</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-secondary-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectData.results.map((result, index) => {
                        const percentage = (result.marks / result.total_marks) * 100;
                        return (
                          <tr key={index} className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50 transition-colors">
                            <td className="py-2 px-3 text-sm text-secondary-600">{result.exam_type || 'N/A'}</td>
                            <td className="py-2 px-3 text-sm text-secondary-900 font-medium">{result.marks}</td>
                            <td className="py-2 px-3 text-sm text-secondary-900">{result.total_marks}</td>
                            <td className="py-2 px-3 text-sm text-secondary-900">{percentage.toFixed(1)}%</td>
                            <td className="py-2 px-3">
                              <span className={`badge ${getGradeColor(result.grade)} flex items-center gap-1`}>
                                {getGradeEmoji(result.grade)} {result.grade || 'N/A'}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-sm text-secondary-500">
                              {result.exam_date ? new Date(result.exam_date).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}

        {subjectAverages.length === 0 && (
          <div className="bg-white rounded-xl shadow-card p-12 border border-secondary-100 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-400 text-4xl">
                <FiBarChart2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-medium text-secondary-900">No Results Found</h3>
              <p className="text-secondary-500 max-w-sm">
                {selectedExamType !== 'all' 
                  ? `No results found for ${selectedExamType} exams` 
                  : 'No results have been added for you yet'}
              </p>
              {selectedExamType !== 'all' && (
                <button
                  onClick={() => setSelectedExamType('all')}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  View all results
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentResults;