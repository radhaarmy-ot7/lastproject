import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiBell,
  FiCalendar,
  FiUser,
  FiRefreshCw,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiFilter,
  FiInfo,
  FiTag,
  FiClock,
  FiSend,
  FiUsers
} from 'react-icons/fi';

const NoticeBoardModule = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    category: 'general',
    target_audience: 'All'
  });

  const categories = ['general', 'exam', 'holiday', 'event', 'meeting', 'urgent'];
  const audiences = ['All', 'Class 9-B', 'Class 10-A', 'Teachers', 'Staff'];

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

  const handleAddNotice = () => {
    setShowAddForm(true);
    setEditingNotice(null);
    setFormData({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      category: 'general',
      target_audience: 'All'
    });
  };

  const handleEditNotice = (notice) => {
    setShowAddForm(true);
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      date: notice.date.split('T')[0],
      category: notice.category || 'general',
      target_audience: notice.target_audience || 'All'
    });
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;

    try {
      const response = await api.delete(`/api/notices/${noticeId}`);
      
      if (response.data.success) {
        toast.success('Notice deleted successfully');
        fetchNotices();
      }
    } catch (error) {
      toast.error('Failed to delete notice');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    
    if (!formData.content.trim()) {
      toast.error('Please enter content');
      return;
    }
    
    try {
      setLoading(true);
      
      const payload = {
        ...formData,
        teacher_id: user?.teacher_id
      };

      let response;
      if (editingNotice) {
        response = await api.put(`/api/notices/${editingNotice.id}`, payload);
      } else {
        response = await api.post('/api/notices', payload);
      }

      if (response.data.success) {
        toast.success(editingNotice ? 'Notice updated successfully' : 'Notice created successfully');
        setShowAddForm(false);
        setEditingNotice(null);
        fetchNotices();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save notice');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-gray-100 text-gray-700',
      exam: 'bg-red-100 text-red-700',
      holiday: 'bg-green-100 text-green-700',
      event: 'bg-purple-100 text-purple-700',
      meeting: 'bg-blue-100 text-blue-700',
      urgent: 'bg-orange-100 text-orange-700'
    };
    return colors[category] || colors.general;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      general: '📢',
      exam: '📝',
      holiday: '🎉',
      event: '🎪',
      meeting: '🤝',
      urgent: '🚨'
    };
    return icons[category] || '📌';
  };

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          notice.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterType === 'all' || notice.category === filterType;
    return matchesSearch && matchesCategory;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotices = filteredNotices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);

  if (loading && notices.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-secondary-500 text-sm">Loading notices...</p>
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
            <FiBell className="w-6 h-6 text-primary-600" />
            Notice Board
          </h1>
          <p className="text-secondary-500 text-sm mt-1">
            {notices.length} notices available
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleAddNotice}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            Add Notice
          </button>
          <button
            onClick={fetchNotices}
            className="btn-secondary flex items-center gap-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
              <FiInfo className="w-5 h-5 text-primary-600" />
              {editingNotice ? 'Edit Notice' : 'Create New Notice'}
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingNotice(null);
              }}
              className="text-secondary-400 hover:text-secondary-600 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter notice title"
                className="input-field"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Target Audience</label>
                <select
                  name="target_audience"
                  value={formData.target_audience}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {audiences.map(aud => (
                    <option key={aud} value={aud}>{aud}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="input-label">Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Enter notice content"
                className="input-field"
                rows="4"
                required
              />
            </div>
            <div>
              <label className="input-label">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
            <div className="flex gap-2 pt-2 border-t border-secondary-100">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-6 flex items-center gap-2"
              >
                <FiSend className="w-4 h-4" />
                {loading ? 'Saving...' : (editingNotice ? 'Update Notice' : 'Create Notice')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingNotice(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-card p-4 border border-secondary-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search notices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {(searchTerm || filterType !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
              className="btn-secondary whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentNotices.map((notice) => {
          const category = notice.category || 'general';
          return (
            <div 
              key={notice.id} 
              className="bg-white rounded-xl shadow-card p-6 border border-secondary-100 hover:shadow-hover transition-all duration-300 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getCategoryColor(category)}`}>
                    <span className="text-lg">{getCategoryIcon(category)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors truncate">
                        {notice.title}
                      </h3>
                      <span className={`badge ${getCategoryColor(category)} flex-shrink-0 text-xs`}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </span>
                    </div>
                    {notice.target_audience && (
                      <div className="flex items-center gap-1 text-xs text-secondary-400 mt-0.5">
                        <FiUsers className="w-3 h-3" />
                        {notice.target_audience}
                      </div>
                    )}
                    <p className="text-sm text-secondary-600 mt-2 line-clamp-2">
                      {notice.content}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  <button
                    onClick={() => handleEditNotice(notice)}
                    className="p-1.5 text-secondary-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                    title="Edit"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteNotice(notice.id)}
                    className="p-1.5 text-secondary-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-secondary-100">
                <div className="flex items-center gap-1 text-xs text-secondary-500">
                  <FiCalendar className="w-3 h-3" />
                  {formatDate(notice.date)}
                </div>
                {notice.created_at && (
                  <div className="flex items-center gap-1 text-xs text-secondary-400">
                    <FiClock className="w-3 h-3" />
                    {formatTime(notice.created_at)}
                  </div>
                )}
                {notice.teacher_name && (
                  <div className="flex items-center gap-1 text-xs text-secondary-500">
                    <FiUser className="w-3 h-3" />
                    {notice.teacher_name}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredNotices.length === 0 && (
        <div className="bg-white rounded-xl shadow-card p-12 border border-secondary-100 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-400 text-4xl">
              <FiBell className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-medium text-secondary-900">No notices found</h3>
            <p className="text-secondary-500 max-w-sm">
              {searchTerm || filterType !== 'all' 
                ? 'No notices match your search criteria' 
                : 'Create your first notice to keep everyone informed'}
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
            {!searchTerm && filterType === 'all' && (
              <button
                onClick={handleAddNotice}
                className="btn-primary mt-2 flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Create Notice
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

export default NoticeBoardModule;