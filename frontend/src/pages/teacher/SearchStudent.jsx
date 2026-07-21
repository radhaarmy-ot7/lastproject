import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiSearch,
  FiUser,
  FiPhone,
  FiCalendar,
  FiBookOpen,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiRefreshCw,
  FiSave,
  FiX,
  FiMapPin,
  FiMail,
  FiUsers,
  FiAward,
  FiInfo,
  FiTrendingUp,
  FiClock
} from 'react-icons/fi';

const SearchStudent = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showFullInfo, setShowFullInfo] = useState(false);
  const [studentStats, setStudentStats] = useState(null);

  const initialAdmission = searchParams.get('admission');
  const isEditMode = searchParams.get('edit') === 'true';

  useEffect(() => {
    if (initialAdmission) {
      setAdmissionNumber(initialAdmission);
      handleSearch(initialAdmission);
    }
  }, [initialAdmission]);

  const handleSearch = async (admissionNum = admissionNumber) => {
    if (!admissionNum) {
      toast.error('Please enter admission number');
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/api/students/${admissionNum}`);
      
      if (response.data.success) {
        setStudent(response.data.data);
        setEditForm(response.data.data);
        setIsEditing(isEditMode);
        
        // Fetch student stats (attendance, results summary)
        try {
          const statsRes = await api.get(`/api/students/dashboard/${admissionNum}`);
          if (statsRes.data.success) {
            setStudentStats(statsRes.data.data);
          }
        } catch (statsError) {
          // Silently fail for stats
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('No student found with this admission number');
        setStudent(null);
        setStudentStats(null);
      } else {
        toast.error('Failed to search student');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({ ...student });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      const response = await api.put(`/api/students/${student.admission_number}`, editForm);
      
      if (response.data.success) {
        toast.success('Student updated successfully');
        setStudent(editForm);
        setIsEditing(false);
        handleSearch(student.admission_number);
      }
    } catch (error) {
      toast.error('Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${student.full_name}?`)) return;

    try {
      const response = await api.delete(`/api/students/${student.admission_number}`);
      
      if (response.data.success) {
        toast.success('Student deleted successfully');
        setStudent(null);
        setAdmissionNumber('');
        navigate('/teacher/students');
      }
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const handleGeneratePDF = async () => {
    try {
      const response = await api.get(`/api/pdf/student/${student.admission_number}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `student_${student.admission_number}_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = () => {
    if (!student) return null;
    return student.is_deleted 
      ? 'badge-danger' 
      : 'badge-success';
  };

  const renderEditFields = () => {
    const fields = [
      { key: 'full_name', label: 'Full Name', icon: FiUser },
      { key: 'father_name', label: "Father's Name", icon: FiUsers },
      { key: 'mother_name', label: "Mother's Name", icon: FiUsers },
      { key: 'date_of_birth', label: 'Date of Birth', icon: FiCalendar, type: 'date' },
      { key: 'class', label: 'Class', icon: FiBookOpen, type: 'number' },
      { key: 'address', label: 'Address', icon: FiMapPin },
      { key: 'phone_number', label: 'Phone Number', icon: FiPhone },
      { key: 'father_occupation', label: "Father's Occupation", icon: FiUser },
      { key: 'mother_occupation', label: "Mother's Occupation", icon: FiUser },
      { key: 'joining_date', label: 'Joining Date', icon: FiCalendar, type: 'date' }
    ];

    return fields.map((field) => (
      <div key={field.key}>
        <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider flex items-center gap-1">
          <field.icon className="w-3 h-3" />
          {field.label}
        </label>
        <input
          type={field.type || 'text'}
          name={field.key}
          value={editForm[field.key] || ''}
          onChange={handleInputChange}
          className="mt-1 w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
      </div>
    ));
  };

  const renderStudentInfo = () => {
    if (!student) return null;

    const infoFields = [
      { key: 'admission_number', label: 'Admission Number', icon: FiInfo },
      { key: 'full_name', label: 'Full Name', icon: FiUser },
      { key: 'father_name', label: "Father's Name", icon: FiUsers },
      { key: 'mother_name', label: "Mother's Name", icon: FiUsers },
      { key: 'date_of_birth', label: 'Date of Birth', icon: FiCalendar },
      { key: 'class', label: 'Class', icon: FiBookOpen },
      { key: 'address', label: 'Address', icon: FiMapPin },
      { key: 'phone_number', label: 'Phone Number', icon: FiPhone },
      { key: 'father_occupation', label: "Father's Occupation", icon: FiUser },
      { key: 'mother_occupation', label: "Mother's Occupation", icon: FiUser },
      { key: 'joining_date', label: 'Joining Date', icon: FiCalendar }
    ];

    return (
      <div className="space-y-6 mt-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 border-b border-secondary-100 pb-4">
          {!student.is_deleted && !isEditing && (
            <>
              <button onClick={handleEdit} className="btn-primary flex items-center gap-2">
                <FiEdit className="w-4 h-4" /> Edit Student
              </button>
              <button onClick={handleGeneratePDF} className="btn-secondary flex items-center gap-2">
                <FiDownload className="w-4 h-4" /> Download PDF
              </button>
              <button onClick={handleDelete} className="btn-danger flex items-center gap-2">
                <FiTrash2 className="w-4 h-4" /> Delete Student
              </button>
              <button 
                onClick={() => setShowFullInfo(!showFullInfo)}
                className="btn-secondary flex items-center gap-2"
              >
                <FiTrendingUp className="w-4 h-4" />
                {showFullInfo ? 'Hide Stats' : 'Show Stats'}
              </button>
            </>
          )}
          {isEditing && (
            <>
              <button onClick={handleSaveEdit} className="btn-success flex items-center gap-2">
                <FiSave className="w-4 h-4" /> Save Changes
              </button>
              <button onClick={handleCancelEdit} className="btn-secondary flex items-center gap-2">
                <FiX className="w-4 h-4" /> Cancel
              </button>
            </>
          )}
        </div>

        {/* Student Stats */}
        {showFullInfo && studentStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-secondary-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-primary-600">
                {studentStats.attendance_percentage || 0}%
              </p>
              <p className="text-xs text-secondary-500">Attendance</p>
            </div>
            <div className="bg-secondary-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-green-600">
                {studentStats.percentage || 0}%
              </p>
              <p className="text-xs text-secondary-500">Results</p>
            </div>
            <div className="bg-secondary-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-purple-600">
                {studentStats.results?.length || 0}
              </p>
              <p className="text-xs text-secondary-500">Subjects</p>
            </div>
            <div className="bg-secondary-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-orange-600">
                {studentStats.attendance?.total_days || 0}
              </p>
              <p className="text-xs text-secondary-500">Total Days</p>
            </div>
          </div>
        )}

        {/* Student Information */}
        <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
              <FiUser className="w-5 h-5 text-primary-600" />
              Student Information
            </h3>
            <span className={`badge ${getStatusBadge()}`}>
              {student.is_deleted ? 'Deleted' : 'Active'}
            </span>
          </div>
          
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderEditFields()}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {infoFields.map((field) => (
                <div key={field.key} className="bg-secondary-50 rounded-lg p-3">
                  <label className="text-xs font-medium text-secondary-500 uppercase tracking-wider flex items-center gap-1">
                    <field.icon className="w-3 h-3" />
                    {field.label}
                  </label>
                  <p className="mt-1 text-secondary-900 font-medium">
                    {student[field.key] || 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
              <FiSearch className="w-6 h-6 text-primary-600" />
              Search Student
            </h1>
            <p className="text-secondary-500 text-sm mt-1">
              Enter admission number to view and manage student details
            </p>
          </div>
          <button 
            onClick={() => navigate('/teacher/students')} 
            className="btn-secondary flex items-center gap-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            Back to List
          </button>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
            <input
              type="number"
              value={admissionNumber}
              onChange={(e) => setAdmissionNumber(e.target.value)}
              placeholder="Enter admission number (e.g., 15000)"
              className="w-full pl-10 pr-4 py-2.5 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button 
            onClick={() => handleSearch()} 
            disabled={loading} 
            className="btn-primary px-8 flex items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FiSearch className="w-4 h-4" />
            )}
            Search
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 mt-6">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-secondary-500 text-sm">Searching for student...</p>
            </div>
          </div>
        ) : (
          renderStudentInfo()
        )}
      </div>
    </div>
  );
};

export default SearchStudent;