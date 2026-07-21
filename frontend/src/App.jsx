import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import TeacherRegistration from './pages/TeacherRegistration';
import TeacherDashboard from './pages/TeacherDashboard';
import SidebarLayout from './components/SidebarLayout';
import StudentList from './pages/teacher/StudentList';
import AddStudent from './pages/teacher/AddStudent';
import SearchStudent from './pages/teacher/SearchStudent';
import AttendanceModule from './pages/teacher/AttendanceModule';
import ResultsModule from './pages/teacher/ResultsModule';
import NoticeBoardModule from './pages/teacher/NoticeBoardModule';
import ActivityLogsModule from './pages/teacher/ActivityLogsModule';
import TeacherProfileModule from './pages/teacher/TeacherProfileModule';
import './App.css';

const TeacherRoutes = () => {
  return (
    <SidebarLayout>
      <Routes>
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="students" element={<StudentList />} />
        <Route path="add-student" element={<AddStudent />} />
        <Route path="search" element={<SearchStudent />} />
        <Route path="attendance" element={<AttendanceModule />} />
        <Route path="results" element={<ResultsModule />} />
        <Route path="notices" element={<NoticeBoardModule />} />
        <Route path="activity-logs" element={<ActivityLogsModule />} />
        <Route path="profile" element={<TeacherProfileModule />} />
        <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
      </Routes>
    </SidebarLayout>
  );
};

const StudentDashboard = () => {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData && userData !== 'undefined' && userData !== 'null') {
      try {
        setUser(JSON.parse(userData));
      } catch {
        window.location.href = '/login';
      }
    } else {
      window.location.href = '/login';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-600">🏫 KV School</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">👋 {user?.full_name || 'Student'}</span>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user?.full_name || 'Student'}! 👋</h2>
          <p className="text-gray-500 mt-1">Here's your academic overview.</p>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<TeacherRegistration />} />
        <Route path="/teacher/*" element={<TeacherRoutes />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/*" element={<StudentDashboard />} />
      </Routes>
    </>
  );
}

export default App;