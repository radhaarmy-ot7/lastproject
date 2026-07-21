import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FiHome,
  FiUsers,
  FiUserPlus,
  FiSearch,
  FiCalendar,
  FiBarChart2,
  FiBell,
  FiLogOut,
  FiUser,
  FiActivity,
  FiFileText,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiSettings,
  FiHelpCircle
} from 'react-icons/fi';

const SidebarLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navItems = [
    { path: '/teacher/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/teacher/students', icon: FiUsers, label: 'All Students' },
    { path: '/teacher/add-student', icon: FiUserPlus, label: 'Add Student' },
    { path: '/teacher/search', icon: FiSearch, label: 'Search Student' },
    { path: '/teacher/attendance', icon: FiCalendar, label: 'Attendance' },
    { path: '/teacher/results', icon: FiBarChart2, label: 'Results' },
    { path: '/teacher/notices', icon: FiBell, label: 'Notices' },
    { path: '/teacher/activity-logs', icon: FiActivity, label: 'Activity Logs' },
    { path: '/teacher/profile', icon: FiUser, label: 'Profile' },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Close sidebar on mobile when clicking a link
  const handleLinkClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-secondary-50">
      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-secondary-200 flex flex-col transition-all duration-300 fixed h-full z-30 shadow-soft ${
          isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-secondary-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              KV
            </div>
            {isSidebarOpen && (
              <div className="transition-opacity duration-300">
                <h1 className="font-bold text-primary-700 text-sm">KV School</h1>
                <p className="text-xs text-secondary-500">Management System</p>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`sidebar-link ${isActive ? 'active' : ''} ${
                  !isSidebarOpen && 'justify-center px-2'
                } group relative`}
                title={!isSidebarOpen ? item.label : ''}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-600' : ''}`} />
                {isSidebarOpen && <span className="ml-2">{item.label}</span>}
                
                {/* Tooltip for collapsed sidebar */}
                {!isSidebarOpen && (
                  <span className="absolute left-full ml-2 px-2 py-1 bg-secondary-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-secondary-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold flex-shrink-0">
              {user?.full_name?.charAt(0) || 'T'}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0 transition-opacity duration-300">
                <p className="text-sm font-medium text-secondary-900 truncate">
                  {user?.full_name || 'Teacher'}
                </p>
                <p className="text-xs text-secondary-500 capitalize">{user?.role || 'Teacher'}</p>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-2">
            {isSidebarOpen && (
              <button
                onClick={() => navigate('/teacher/profile')}
                className="flex items-center gap-3 w-full px-4 py-2 text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors duration-200 font-medium text-sm"
              >
                <FiSettings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 font-medium ${
                !isSidebarOpen && 'justify-center'
              }`}
            >
              <FiLogOut className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${isSidebarOpen ? 'md:ml-64 ml-0' : 'md:ml-20 ml-0'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white border-b border-secondary-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-secondary-800 hidden sm:block">
              {location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification bell */}
            <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors relative">
              <FiBell className="w-5 h-5 text-secondary-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <span className="text-sm text-secondary-500 hidden sm:inline">
              Welcome, {user?.full_name?.split(' ')[0] || 'Teacher'}
            </span>
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold sm:hidden">
              {user?.full_name?.charAt(0) || 'T'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          <div className="fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;