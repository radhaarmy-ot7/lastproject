import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SidebarLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const teacherLinks = [
    { name: 'Dashboard', path: '/teacher/dashboard', icon: '📊' },
    { name: 'Manage Students', path: '/teacher/students', icon: '🎓' },
    { name: 'Attendance', path: '/teacher/attendance', icon: '📝' },
    { name: 'Results', path: '/teacher/results', icon: '🏆' },
    { name: 'Notices', path: '/teacher/notices', icon: '📢' },
    { name: 'Activity Logs', path: '/teacher/logs', icon: '📋' },
    { name: 'My Profile', path: '/teacher/profile', icon: '👤' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans antialiased">
      {/* Sidebar Navigation Panel */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
        <div>
          {/* Main Context Branding Area (No Logo Requirement) */}
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">KV School System</h1>
          </div>
          <nav className="p-4 space-y-1">
            {teacherLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.name}
                  onClick={() => navigate(link.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  <span>{link.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Action Tray Footer Context */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'T'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-gray-900 truncate">{user?.name || 'Teacher Profile'}</p>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Primary Context Container Viewport Frame Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;