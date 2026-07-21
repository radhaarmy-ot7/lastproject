import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiFileText,
  FiAward,
  FiTrendingUp,
  FiCalendar,
  FiClock,
  FiDownload,
  FiPrinter,
  FiBarChart2,
  FiBookOpen,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiUsers,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight
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

const StudentReportModule = () => {
  const { user } = useAuth();
  const [reportCards, setReportCards] = useState([]);
  const [activeTermIndex, setActiveTermIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [overallStats, setOverallStats] = useState({
    totalExams: 0,
    averagePercentage: 0,
    bestSubject: '',
    weakestSubject: '',
    totalSubjects: 0
  });

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const admissionNumber = user?.admission_number || user?.id;
      
      // Fetch student report
      const response = await api.get(`/api/students/report/${admissionNumber}`);
      
      if (response.data.success) {
        const data = response.data.data;
        // Transform data for display
        const reports = [];
        
        // Group results by exam type
        const groupedResults = {};
        (data.results || []).forEach(result => {
          if (!groupedResults[result.exam_type]) {
            groupedResults[result.exam_type] = [];
          }
          groupedResults[result.exam_type].push(result);
        });

        // Create report cards from grouped results
        Object.keys(groupedResults).forEach(examType => {
          const results = groupedResults[examType];
          const totalMarks = results.reduce((sum, r) => sum + r.total_marks, 0);
          const obtainedMarks = results.reduce((sum, r) => sum + r.marks, 0);
          const percentage = ((obtainedMarks / totalMarks) * 100).toFixed(2);
          
          reports.push({
            exam_term: examType,
            total_marks: totalMarks,
            obtained_marks: obtainedMarks,
            percentage: `${percentage}%`,
            status: parseFloat(percentage) >= 40 ? 'Passed' : 'Failed',
            published_date: results[0]?.exam_date || new Date().toISOString().split('T')[0],
            subjects: results.map(r => ({
              name: r.subject,
              marks: r.marks,
              total: r.total_marks,
              grade: r.grade || 'N/A',
              passStatus: parseFloat((r.marks / r.total_marks * 100).toFixed(1)) >= 40 ? 'Pass' : 'Fail'
            }))
          });
        });

        setReportCards(reports);
        calculateOverallStats(reports);
      }
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallStats = (reports) => {
    if (reports.length === 0) return;

    let totalExams = reports.length;
    let totalPercentage = 0;
    let subjectPerformance = {};

    reports.forEach(report => {
      totalPercentage += parseFloat(report.percentage);
      report.subjects.forEach(subject => {
        if (!subjectPerformance[subject.name]) {
          subjectPerformance[subject.name] = {
            totalMarks: 0,
            count: 0
          };
        }
        subjectPerformance[subject.name].totalMarks += subject.marks;
        subjectPerformance[subject.name].count += 1;
      });
    });

    // Calculate average per subject
    let bestSubject = '';
    let bestScore = 0;
    let weakestSubject = '';
    let weakestScore = 100;

    Object.keys(subjectPerformance).forEach(subject => {
      const avg = subjectPerformance[subject].totalMarks / subjectPerformance[subject].count;
      if (avg > bestScore) {
        bestScore = avg;
        bestSubject = subject;
      }
      if (avg < weakestScore) {
        weakestScore = avg;
        weakestSubject = subject;
      }
    });

    setOverallStats({
      totalExams,
      averagePercentage: parseFloat((totalPercentage / totalExams).toFixed(2)),
      bestSubject,
      weakestSubject,
      totalSubjects: Object.keys(subjectPerformance).length
    });
  };

  const handleGeneratePDF = async () => {
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
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const activeCard = reportCards[activeTermIndex];

  const getGradeColor = (grade) => {
    switch(grade) {
      case 'A+':
      case 'A': return 'text-green-600';
      case 'B': return 'text-blue-600';
      case 'C': return 'text-yellow-600';
      default: return 'text-red-600';
    }
  };

  const getStatusBadge = (status) => {
    return status === 'Passed' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-secondary-500 text-sm">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
              <FiFileText className="w-6 h-6 text-primary-600" />
              Academic Performance Reports
            </h1>
            <p className="text-secondary-500 text-sm mt-1">
              {reportCards.length} term reports available
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleGeneratePDF}
              className="btn-secondary flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="btn-secondary flex items-center gap-2"
            >
              <FiPrinter className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      {reportCards.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <FiBarChart2 className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-secondary-900">{overallStats.totalExams}</p>
            <p className="text-xs text-secondary-500">Total Exams</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <FiTrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{overallStats.averagePercentage}%</p>
            <p className="text-xs text-secondary-500">Avg Percentage</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <FiAward className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">{overallStats.bestSubject || 'N/A'}</p>
            <p className="text-xs text-secondary-500">Best Subject</p>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <FiBookOpen className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-secondary-900">{overallStats.totalSubjects}</p>
            <p className="text-xs text-secondary-500">Total Subjects</p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
          {errorMsg}
        </div>
      )}

      {reportCards.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card p-12 border border-secondary-100 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-400 text-4xl">
              <FiFileText className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-medium text-secondary-900">No Reports Available</h3>
            <p className="text-secondary-500 max-w-sm">
              No academic reports have been published for you yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Term List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary-400 mb-2 flex items-center gap-1">
              <FiCalendar className="w-4 h-4" />
              Available Terms
            </h3>
            {reportCards.map((card, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTermIndex(idx)}
                className={`w-full text-left p-4 rounded-lg border transition-all shadow-sm ${
                  activeTermIndex === idx 
                    ? 'bg-primary-600 border-primary-600 text-white font-semibold' 
                    : 'bg-white border-secondary-200 text-secondary-700 hover:border-primary-300 hover:shadow-md font-medium'
                }`}
              >
                <div className="text-sm leading-tight">{card.exam_term}</div>
                <div className={`text-xs mt-1 font-mono ${activeTermIndex === idx ? 'text-primary-100' : 'text-secondary-400'}`}>
                  Score: {card.percentage}
                </div>
              </button>
            ))}
          </div>

          {/* Active Term Details */}
          {activeCard && (
            <div className="lg:col-span-2 space-y-6">
              
              {/* Score Summary */}
              <div className="bg-white border border-secondary-200 rounded-lg shadow-sm p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="block text-[10px] text-secondary-400 uppercase tracking-wide font-bold">Marks Obtained</span>
                  <span className="text-xl font-bold font-mono text-secondary-800 mt-0.5 block">
                    {activeCard.obtained_marks} <span className="text-xs text-secondary-400 font-normal">/ {activeCard.total_marks}</span>
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-secondary-400 uppercase tracking-wide font-bold">Percentage</span>
                  <span className="text-xl font-bold font-mono text-secondary-900 mt-0.5 block">{activeCard.percentage}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-secondary-400 uppercase tracking-wide font-bold">Status</span>
                  <span className={`text-xl font-bold mt-0.5 block ${activeCard.status === 'Passed' ? 'text-green-600' : 'text-red-600'}`}>
                    {activeCard.status === 'Passed' ? <FiCheckCircle className="inline w-5 h-5" /> : <FiXCircle className="inline w-5 h-5" />}
                    {activeCard.status}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-secondary-400 uppercase tracking-wide font-bold">Published</span>
                  <span className="text-sm font-semibold font-mono text-secondary-500 mt-1 block">{activeCard.published_date}</span>
                </div>
              </div>

              {/* Subject Performance Chart */}
              <div className="bg-white border border-secondary-200 rounded-lg shadow-sm p-6">
                <h4 className="text-sm font-semibold text-secondary-700 mb-4 flex items-center gap-2">
                  <FiBarChart2 className="w-4 h-4 text-primary-600" />
                  Subject-wise Performance
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeCard.subjects}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="marks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Subject Table */}
              <div className="bg-white border border-secondary-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-3 bg-secondary-50 border-b border-secondary-200">
                  <h4 className="text-sm font-semibold text-secondary-700 flex items-center gap-2">
                    <FiBookOpen className="w-4 h-4 text-primary-600" />
                    Subject Details
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-secondary-50 text-secondary-400 uppercase tracking-wider text-[10px] font-bold border-b border-secondary-200">
                        <th className="px-6 py-3.5">Subject</th>
                        <th className="px-6 py-3.5 text-center">Marks</th>
                        <th className="px-6 py-3.5 text-center">Total</th>
                        <th className="px-6 py-3.5 text-center">Percentage</th>
                        <th className="px-6 py-3.5 text-center">Grade</th>
                        <th className="px-6 py-3.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-100 font-medium text-secondary-700">
                      {activeCard.subjects.map((sub, sIdx) => {
                        const percentage = ((sub.marks / sub.total) * 100).toFixed(1);
                        return (
                          <tr key={sIdx} className="hover:bg-secondary-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-secondary-900">{sub.name}</td>
                            <td className="px-6 py-4 text-center font-mono font-bold text-secondary-600">{sub.marks}</td>
                            <td className="px-6 py-4 text-center font-mono text-secondary-400">{sub.total}</td>
                            <td className="px-6 py-4 text-center font-mono font-bold text-secondary-700">{percentage}%</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`font-bold ${getGradeColor(sub.grade)}`}>
                                {sub.grade || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                                sub.passStatus === 'Pass' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                              }`}>
                                {sub.passStatus}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default StudentReportModule;