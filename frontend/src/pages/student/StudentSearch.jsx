import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiSearch,
  FiUser,
  FiCalendar,
  FiPhone,
  FiBookOpen,
  FiMapPin,
  FiUsers,
  FiAward,
  FiTrendingUp,
  FiMail,
  FiClock,
  FiInfo
} from 'react-icons/fi';

const StudentSearch = () => {
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!admissionNumber) {
      toast.error('Please enter admission number');
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      const response = await api.get(`/api/students/${admissionNumber}`);
      
      if (response.data.success) {
        setStudent(response.data.data);
        // Add to recent searches
        const newRecent = [admissionNumber, ...recentSearches.filter(s => s !== admissionNumber)].slice(0, 5);
        setRecentSearches(newRecent);
        toast.success('Student found!');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setStudent(null);
        toast.error('No student found with this admission number');
      } else {
        toast.error('Failed to search student');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecentClick = (admission) => {
    setAdmissionNumber(admission);
    // Auto-search
    handleSearch({ preventDefault: () => {} });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (isDeleted) => {
    return isDeleted 
      ? 'badge-danger' 
      : 'badge-success';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-card p-6 text-white">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FiSearch className="w-6 h-6" />
          Search Student
        </h1>
        <p className="text-blue-100 text-sm mt-1">
          Enter admission number to view student details
        </p>
        
        <form onSubmit={handleSearch} className="flex gap-3 mt-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
            <input
              type="number"
              value={admissionNumber}
              onChange={(e) => setAdmissionNumber(e.target.value)}
              placeholder="Enter admission number (e.g., 15000)"
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FiSearch className="w-4 h-4" />
            )}
            Search
          </button>
        </form>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-blue-200">Recent:</span>
            {recentSearches.map((admission, index) => (
              <button
                key={index}
                onClick={() => handleRecentClick(admission)}
                className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs transition-colors"
              >
                #{admission}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Results */}
      {searched && (
        <>
          {student ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Student Profile Card */}
              <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-lg">
                    {student.full_name?.charAt(0) || 'S'}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h2 className="text-2xl font-bold text-secondary-900">{student.full_name}</h2>
                      <span className={`badge ${getStatusBadge(student.is_deleted)}`}>
                        {student.is_deleted ? 'Deleted' : 'Active'}
                      </span>
                    </div>
                    <p className="text-secondary-500 flex items-center justify-center sm:justify-start gap-2">
                      <FiInfo className="w-4 h-4" />
                      Admission: {student.admission_number}
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                      <span className="text-sm text-secondary-500 bg-secondary-100 px-3 py-1 rounded-full">
                        <FiBookOpen className="inline mr-1 w-3 h-3" />
                        Class: {student.class || 'N/A'}
                      </span>
                      <span className="text-sm text-secondary-500 bg-secondary-100 px-3 py-1 rounded-full">
                        <FiCalendar className="inline mr-1 w-3 h-3" />
                        Joined: {formatDate(student.joining_date)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                  <FiUser className="w-5 h-5 text-primary-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-secondary-50 rounded-lg p-3">
                    <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Full Name</label>
                    <p className="mt-1 text-secondary-900 font-medium">{student.full_name}</p>
                  </div>
                  <div className="bg-secondary-50 rounded-lg p-3">
                    <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Date of Birth</label>
                    <p className="mt-1 text-secondary-900 font-medium">{formatDate(student.date_of_birth)}</p>
                  </div>
                  <div className="bg-secondary-50 rounded-lg p-3">
                    <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Phone Number</label>
                    <p className="mt-1 text-secondary-900 font-medium">{student.phone_number || 'N/A'}</p>
                  </div>
                  <div className="bg-secondary-50 rounded-lg p-3">
                    <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Address</label>
                    <p className="mt-1 text-secondary-900 font-medium">{student.address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Family Information */}
              <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                  <FiUsers className="w-5 h-5 text-green-600" />
                  Family Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-secondary-50 rounded-lg p-3">
                    <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Father's Name</label>
                    <p className="mt-1 text-secondary-900 font-medium">{student.father_name || 'N/A'}</p>
                  </div>
                  <div className="bg-secondary-50 rounded-lg p-3">
                    <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Mother's Name</label>
                    <p className="mt-1 text-secondary-900 font-medium">{student.mother_name || 'N/A'}</p>
                  </div>
                  <div className="bg-secondary-50 rounded-lg p-3">
                    <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Father's Occupation</label>
                    <p className="mt-1 text-secondary-900 font-medium">{student.father_occupation || 'N/A'}</p>
                  </div>
                  <div className="bg-secondary-50 rounded-lg p-3">
                    <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Mother's Occupation</label>
                    <p className="mt-1 text-secondary-900 font-medium">{student.mother_occupation || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                  <FiAward className="w-5 h-5 text-yellow-600" />
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-secondary-50 rounded-lg p-3">
                    <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Admission Number</label>
                    <p className="mt-1 text-secondary-900 font-medium">#{student.admission_number}</p>
                  </div>
                  <div className="bg-secondary-50 rounded-lg p-3">
                    <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Class</label>
                    <p className="mt-1 text-secondary-900 font-medium">{student.class || 'N/A'}</p>
                  </div>
                  <div className="bg-secondary-50 rounded-lg p-3">
                    <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Joining Date</label>
                    <p className="mt-1 text-secondary-900 font-medium">{formatDate(student.joining_date)}</p>
                  </div>
                  <div className="bg-secondary-50 rounded-lg p-3">
                    <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Status</label>
                    <p className="mt-1">
                      <span className={`badge ${student.is_deleted ? 'badge-danger' : 'badge-success'}`}>
                        {student.is_deleted ? 'Deleted' : 'Active'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-card p-12 border border-secondary-100 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-400 text-4xl">
                  <FiSearch className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-medium text-secondary-900">No Student Found</h3>
                <p className="text-secondary-500 max-w-sm">
                  No student exists with admission number: <strong>{admissionNumber}</strong>
                </p>
                <p className="text-sm text-secondary-400 mt-2 flex items-center gap-1">
                  <FiInfo className="w-4 h-4" />
                  Please check the admission number and try again
                </p>
                <button
                  onClick={() => {
                    setAdmissionNumber('');
                    setSearched(false);
                    setStudent(null);
                  }}
                  className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Try another search
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {!searched && (
        <div className="bg-white rounded-xl shadow-card p-12 border border-secondary-100 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-400 text-4xl">
              <FiUser className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-medium text-secondary-900">Search for a Student</h3>
            <p className="text-secondary-500 max-w-sm">
              Enter an admission number above to view student details
            </p>
            <div className="flex items-center gap-2 text-xs text-secondary-400 bg-secondary-50 px-4 py-2 rounded-lg mt-2">
              <FiInfo className="w-4 h-4" />
              Example: 15000, 15001, 15002
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSearch;