import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiBell,
  FiCalendar,
  FiUser,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiFileText,
  FiTag
} from 'react-icons/fi';

const StudentNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/notices');
      
      if (response.data.success) {
        setNotices(response.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNoticeType = (notice) => {
    if (notice.title?.toLowerCase().includes('exam')) return 'exam';
    if (notice.title?.toLowerCase().includes('holiday')) return 'holiday';
    if (notice.title?.toLowerCase().includes('event')) return 'event';
    if (notice.title?.toLowerCase().includes('meeting')) return 'meeting';
    return 'general';
  };

  const getTypeBadge = (type) => {
    const badges = {
      exam: 'bg-red-100 text-red-800',
      holiday: 'bg-green-100 text-green-800',
      event: 'bg-purple-100 text-purple-800',
      meeting: 'bg-blue-100 text-blue-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return badges[type] || badges.general;
  };

  const getTypeIcon = (type) => {
    const icons = {
      exam: '📝',
      holiday: '🎉',
      event: '🎪',
      meeting: '🤝',
      general: '📢'
    };
    return icons[type] || icons.general;
  };

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          notice.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || getNoticeType(notice) === filterType;
    return matchesSearch && matchesType;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotices = filteredNotices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);

  const noticeTypes = ['all', 'exam', 'holiday', 'event', 'meeting', 'general'];

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
            <h1 className="text-2xl font-bold text-secondary-900">Notice Board</h1>
            <p className="text-secondary-500 text-sm mt-1">
              {notices.length} notices available
            </p>
          </div>
          <button 
            onClick={fetchNotices} 
            className="btn-secondary flex items-center gap-2"
          >
            <FiRefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search notices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {noticeTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filterType === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentNotices.map((notice) => {
          const type = getNoticeType(notice);
          return (
            <div 
              key={notice.id} 
              className="bg-white rounded-xl shadow-card p-6 border border-secondary-100 hover:shadow-hover transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeBadge(type)}`}>
                  <span className="text-2xl">{getTypeIcon(type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                      {notice.title}
                    </h3>
                    <span className={`badge ${getTypeBadge(type)} flex-shrink-0`}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                  </div>
                  <p className="text-secondary-600 mt-2 leading-relaxed">
                    {notice.content}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-secondary-100">
                    <div className="flex items-center gap-1 text-sm text-secondary-500">
                      <FiCalendar className="w-4 h-4" />
                      {formatDate(notice.date)}
                    </div>
                    {notice.teacher_name && (
                      <div className="flex items-center gap-1 text-sm text-secondary-500">
                        <FiUser className="w-4 h-4" />
                        {notice.teacher_name}
                      </div>
                    )}
                    {notice.created_at && (
                      <div className="flex items-center gap-1 text-xs text-secondary-400">
                        <FiClock className="w-3 h-3" />
                        Posted: {formatTime(notice.created_at)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredNotices.length === 0 && (
        <div className="bg-white rounded-xl shadow-card p-12 border border-secondary-100 text-center">
          <div className="flex flex-col items-center gap-3">
            <FiBell className="w-16 h-16 text-secondary-300" />
            <h3 className="text-lg font-medium text-secondary-900">No notices found</h3>
            <p className="text-secondary-500">
              {searchTerm || filterType !== 'all' 
                ? 'No notices match your filters' 
                : 'No notices available at the moment'}
            </p>
            {(searchTerm || filterType !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                }}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl shadow-card border border-secondary-100">
          <p className="text-sm text-secondary-500">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredNotices.length)} of {filteredNotices.length} notices
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
  );
};

export default StudentNotices;