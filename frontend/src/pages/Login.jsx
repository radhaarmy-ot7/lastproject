import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState('teacher');
  const [formData, setFormData] = useState({
    teacher_id: '',
    password: '',
    name: '',
    admission_number: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setFormData({
      teacher_id: '',
      password: '',
      name: '',
      admission_number: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let endpoint = '';
      let payload = {};

      if (role === 'teacher') {
        endpoint = '/api/teachers/login';
        payload = {
          teacher_id: formData.teacher_id,
          password: formData.password
        };
      } else {
        endpoint = '/api/students/login';
        payload = {
          name: formData.name,
          admission_number: parseInt(formData.admission_number)
        };
      }

      const response = await api.post(endpoint, payload);
      const loginData = response.data?.data || response.data;
      
      if (response.data?.success || loginData?.token) {
        const token = loginData?.token || response.data?.token;
        const user = loginData?.user || response.data?.user;

        if (token && user) {
          login(token, user);
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          toast.success('Login successful! Welcome back! 🎉');
          
          if (role === 'teacher') {
            navigate('/teacher/dashboard', { replace: true });
          } else {
            navigate('/student/dashboard', { replace: true });
          }
        } else {
          throw new Error(response.data?.message || 'Login response was incomplete.');
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-soft p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-3xl">KV</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">KV School Management</h1>
            <p className="text-gray-500 text-sm">Sign in to access the system</p>
          </div>

          <div className="flex gap-2 bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => handleRoleChange('teacher')}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                role === 'teacher'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              👨‍🏫 Teacher
            </button>
            <button
              onClick={() => handleRoleChange('student')}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                role === 'student'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              👨‍🎓 Student
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {role === 'teacher' ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Teacher ID</label>
                  <input
                    type="text"
                    name="teacher_id"
                    value={formData.teacher_id}
                    onChange={handleInputChange}
                    placeholder="Enter your Teacher ID"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Student Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Admission Number</label>
                  <input
                    type="number"
                    name="admission_number"
                    value={formData.admission_number}
                    onChange={handleInputChange}
                    placeholder="Enter your admission number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?
              <Link to="/register" className="ml-2 text-blue-600 hover:text-blue-700 font-medium">
                Register as Teacher
              </Link>
            </p>
            <p className="text-xs text-gray-400 mt-2">Default: T001 / teacher123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;