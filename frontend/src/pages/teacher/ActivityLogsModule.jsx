import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiActivity,
  FiUser,
  FiClock,
  FiRefreshCw,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiDownload,
  FiSearch,
  FiInfo,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';

const ActivityLogsModule = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/activity-logs');
      
      if (response.data.success) {
        const data = response.data.data || [];
        setLogs(data);
        calculateStats(data);
      }
    } catch (error) {
      toast.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      total: data.length,
      today: data.filter(log => new Date(log.created_at) >= today).length,
      thisWeek: data.filter(log => new Date(log.created_at) >= weekStart).length,
      thisMonth: data.filter(log => new Date(log.created_at) >= monthStart).length
    };
    setStats(stats);
  };

  const fetchFilteredLogs = async () => {
    try {
      setLoading(true);
      
      let endpoint = '/api/activity-logs';
      const params = new URLSearchParams();
      
      if (dateRange.start && dateRange.end) {
        endpoint = `/api/activity-logs/date-range?start_date=${dateRange.start}&end_date=${dateRange.end}`;
      }
      
      const response = await api.get(endpoint);
      
      if (response.data.success) {
        let filteredLogs = response.data.data || [];
        
        if (filter !== 'all') {
          filteredLogs = filteredLogs.filter(log => log.action === filter);
        }
        
        setLogs(filteredLogs);
        calculateStats(filteredLogs);
      }
    } catch (error) {
      toast.error('Failed to fetch filtered logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    const colors = {
      'LOGIN': 'badge-success',
      'LOGOUT': 'badge-info',
      'STUDENT_ADD': 'badge-success',
      'STUDENT_UPDATE': 'badge-info',
      'STUDENT_DELETE': 'badge-danger',
      'STUDENT_RESTORE': 'badge-warning',
      'STUDENT_PERMANENT_DELETE': 'badge-danger',
      'ATTENDANCE_MARK': 'badge-info',
      'BULK_ATTENDANCE_MARK': 'badge-info',
      'RESULT_ADD': 'badge-success',
      'RESULT_UPDATE': 'badge-info',
      'RESULT_DELETE': 'badge-danger',
      'NOTICE_CREATE': 'badge-info',
      'NOTICE_UPDATE': 'badge-warning',
      'NOTICE_DELETE': 'badge-danger',
      'PROFILE_UPDATE': 'badge-info',
      'PASSWORD_CHANGE': 'badge-warning',
      'REGISTER': 'badge-success',
      'LOGS_CLEANUP': 'badge-warning'
    };
    return colors[action] || 'badge-secondary';
  };

  const getActionIcon = (action) => {
    const icons = {
      'LOGIN': '🔐',
      'LOGOUT': '🚪',
      'STUDENT_ADD': '➕',
      'STUDENT_UPDATE': '✏️',
      'STUDENT_DELETE': '🗑️',
      'STUDENT_RESTORE': '♻️',
      'STUDENT_PERMANENT_DELETE': '💀',
      'ATTENDANCE_MARK': '📋',
      'BULK_ATTENDANCE_MARK': '📋',
      'RESULT_ADD': '📊',
      'RESULT_UPDATE': '📝',
      'RESULT_DELETE': '❌',
      'NOTICE_CREATE': '📢',
      'NOTICE_UPDATE': '📝',
      'NOTICE_DELETE': '❌',
      'PROFILE_UPDATE': '👤',
      'PASSWORD_CHANGE': '🔑',
      'REGISTER': '📝',
      'LOGS_CLEANUP': '🧹'
    };
    return icons[action] || '📌';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
  };

  const handleExport = () => {
    try {
      const csvData = logs.map(log => ({
        Action: log.action,
        Teacher: log.teacher_name || log.teacher_id || 'System',
        Details: log.details ? JSON.stringify(log.details) : '-',
        Timestamp: formatDate(log.created_at)
      }));

      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Logs exported successfully');
    } catch (error) {
      toast.error('Failed to export logs');
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.details)?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const uniqueActions = [...new Set(logs.map(log => log.action))];

  if (loading && logs.length === 0) {
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
          <h1 className="text-2xl font-bold text-secondary-900">Activity Logs</h1>
          <p className="text-secondary-500 text-sm mt-1">
            {logs.length} activities recorded
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
            onClick={fetchLogs}
            className="btn-secondary flex items-center gap-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center">
          <p className="text-2xl font-bold text-primary-600">{stats.total}</p>
          <p className="text-xs text-secondary-500">Total Activities</p>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.today}</p>
          <p className="text-xs text-secondary-500">Today</p>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.thisWeek}</p>
          <p className="text-xs text-secondary-500">This Week</p>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100 text-center">
          <p className="text-2xl font-bold text-purple-600">{stats.thisMonth}</p>
          <p className="text-xs text-secondary-500">This Month</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="input-label">Action Type</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="input-label">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="input-label">Search</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={fetchFilteredLogs}
            className="btn-primary flex items-center gap-2"
          >
            <FiFilter className="w-4 h-4" />
            Apply Filters
          </button>
          <button
            onClick={() => {
              setFilter('all');
              setDateRange({ start: '', end: '' });
              setSearchTerm('');
              fetchLogs();
            }}
            className="btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-card border border-secondary-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary-50 border-b border-secondary-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Teacher</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Details</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {currentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-secondary-50 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getActionIcon(log.action)}</span>
                      <span className={`badge ${getActionColor(log.action)}`}>
                        {log.action || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xs font-bold">
                        {log.teacher_name?.charAt(0) || 'S'}
                      </div>
                      <span className="text-sm text-secondary-900">
                        {log.teacher_name || log.teacher_id || 'System'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-secondary-600 max-w-xs truncate group-hover:max-w-none transition-all">
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4 text-secondary-400" />
                      <span className="text-sm text-secondary-600">
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-secondary-400 bg-secondary-100 px-2 py-1 rounded-full">
                      {getTimeAgo(log.created_at)}
                    </span>
                  </td>
                </tr>
              ))}
              {currentLogs.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-secondary-500">
                    <div className="flex flex-col items-center gap-2">
                      <FiActivity className="w-12 h-12 text-secondary-300" />
                      <p>No activity logs found</p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                          Clear search
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
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLogs.length)} of {filteredLogs.length} logs
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
    </div>
  );
};

export default ActivityLogsModule;