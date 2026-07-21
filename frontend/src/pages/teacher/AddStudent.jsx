import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiUser,
  FiUserPlus,
  FiCalendar,
  FiPhone,
  FiMapPin,
  FiBookOpen,
  FiBriefcase,
  FiUserCheck,
  FiX,
  FiSave,
  FiRefreshCw,
  FiInfo
} from 'react-icons/fi';

const AddStudent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    father_name: '',
    mother_name: '',
    date_of_birth: '',
    class: '',
    address: '',
    phone_number: '',
    father_occupation: '',
    mother_occupation: '',
    joining_date: ''
  });
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }
    
    if (!formData.father_name.trim()) {
      newErrors.father_name = "Father's name is required";
    }
    
    if (!formData.mother_name.trim()) {
      newErrors.mother_name = "Mother's name is required";
    }
    
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    }
    
    if (!formData.class) {
      newErrors.class = 'Class is required';
    } else if (parseInt(formData.class) < 1 || parseInt(formData.class) > 12) {
      newErrors.class = 'Class must be between 1 and 12';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Phone number must be 10 digits';
    }
    
    if (!formData.joining_date) {
      newErrors.joining_date = 'Joining date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);

    try {
      const response = await api.post('/api/students', formData);
      
      if (response.data.success) {
        toast.success('Student added successfully! 🎉');
        navigate('/teacher/students');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add student';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all fields?')) {
      setFormData({
        full_name: '',
        father_name: '',
        mother_name: '',
        date_of_birth: '',
        class: '',
        address: '',
        phone_number: '',
        father_occupation: '',
        mother_occupation: '',
        joining_date: ''
      });
      setErrors({});
      toast.success('Form cleared');
    }
  };

  const inputFields = [
    { 
      label: 'Full Name', 
      name: 'full_name', 
      type: 'text', 
      required: true, 
      icon: FiUser,
      placeholder: 'Enter full name'
    },
    { 
      label: "Father's Name", 
      name: 'father_name', 
      type: 'text', 
      required: true, 
      icon: FiUserCheck,
      placeholder: "Enter father's name"
    },
    { 
      label: "Mother's Name", 
      name: 'mother_name', 
      type: 'text', 
      required: true, 
      icon: FiUserCheck,
      placeholder: "Enter mother's name"
    },
    { 
      label: 'Date of Birth', 
      name: 'date_of_birth', 
      type: 'date', 
      required: true, 
      icon: FiCalendar
    },
    { 
      label: 'Class', 
      name: 'class', 
      type: 'number', 
      required: true, 
      min: 1, 
      max: 12,
      icon: FiBookOpen,
      placeholder: '1-12'
    },
    { 
      label: 'Address', 
      name: 'address', 
      type: 'text', 
      required: true, 
      icon: FiMapPin,
      placeholder: 'Enter complete address'
    },
    { 
      label: 'Phone Number', 
      name: 'phone_number', 
      type: 'tel', 
      required: true, 
      icon: FiPhone,
      placeholder: '10 digit mobile number'
    },
    { 
      label: "Father's Occupation", 
      name: 'father_occupation', 
      type: 'text', 
      icon: FiBriefcase,
      placeholder: "Enter father's occupation"
    },
    { 
      label: "Mother's Occupation", 
      name: 'mother_occupation', 
      type: 'text', 
      icon: FiBriefcase,
      placeholder: "Enter mother's occupation"
    },
    { 
      label: 'Joining Date', 
      name: 'joining_date', 
      type: 'date', 
      required: true, 
      icon: FiCalendar
    }
  ];

  // Calculate next admission number (display only)
  const getNextAdmissionNumber = () => {
    return 'Auto-generated (starts from 15000)';
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-card p-6 border border-secondary-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
              <FiUserPlus className="w-6 h-6 text-primary-600" />
              Add New Student
            </h1>
            <p className="text-secondary-500 text-sm mt-1">
              Admission number will be auto-generated: <span className="text-primary-600 font-medium">{getNextAdmissionNumber()}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn-secondary flex items-center gap-2"
              type="button"
            >
              <FiInfo className="w-4 h-4" />
              {showPreview ? 'Hide Preview' : 'Preview'}
            </button>
            <button
              onClick={() => navigate('/teacher/students')}
              className="btn-secondary flex items-center gap-2"
              type="button"
            >
              <FiX className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="mb-6 p-4 bg-secondary-50 rounded-lg border border-secondary-200">
            <h3 className="text-sm font-semibold text-secondary-700 mb-2">Form Preview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              {Object.entries(formData).map(([key, value]) => (
                value && (
                  <div key={key} className="flex items-center gap-1">
                    <span className="text-secondary-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="text-secondary-900 font-medium">{value}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inputFields.map((field) => (
              <div 
                key={field.name} 
                className={field.name === 'address' ? 'md:col-span-2' : ''}
              >
                <label className="input-label">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  {field.icon && (
                    <field.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                  )}
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    className={`input-field ${field.icon ? 'pl-9' : ''} ${errors[field.name] ? 'border-red-500 focus:ring-red-500' : ''}`}
                    required={field.required}
                    min={field.min}
                    max={field.max}
                  />
                </div>
                {errors[field.name] && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <FiX className="w-3 h-3" />
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-secondary-200">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-6 py-2.5 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  Add Student
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="btn-secondary flex items-center gap-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;