import React, { useState, useEffect } from 'react';
import SidebarLayout from '../components/SidebarLayout';
import { useAuth } from '../context/AuthContext';

const TeacherDashboard = () => {
  const { user } = useAuth();
  
  // Dummy metrics block structure matching layout target frames
  const [stats, setStats] = useState({
    totalStudents: 128,
    activeStudents: 124,
    deletedStudents: 4,
  });

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, action: 'Added student "Rahul Sharma"', time: '20 mins ago', type: 'create' },
    { id: 2, action: 'Updated record for Admission ID 15024', time: '1 hour ago', type: 'update' },
    { id: 3, action: 'Published new alert notice: "Mid-Term Examination Schedule"', time: '3 hours ago', type: 'notice' },
    { id: 4, action: 'Marked Class 10 Attendance configuration parameters', time: '4 hours ago', type: 'attendance' },
  ]);

  return (
    <SidebarLayout>
      {/* Header Profile Indicator Segment */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back, {user?.name || 'Teacher'}!</h2>
        <p className="text-gray-500 mt-1">Here is a comprehensive overview of your administrative workspace statistics today.</p>
      </div>

      {/* Metrics Counter Card Array Grid Segment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Enrolled Students</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalStudents}</h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-2xl text-blue-600">👥</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Active Cohort Records</p>
            <h3 className="text-3xl font-bold text-emerald-600 mt-1">{stats.activeStudents}</h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-2xl text-emerald-600">✅</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Archived / Deleted Entries</p>
            <h3 className="text-3xl font-bold text-red-600 mt-1">{stats.deletedStudents}</h3>
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-2xl text-red-600">🗑️</div>
        </div>
      </div>

      {/* Quick Access Control Board Component */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <h4 className="text-sm font-semibold uppercase text-gray-400 tracking-wider mb-4">Quick Task Utilities</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all group">
            <span className="text-xl mb-1 transform group-hover:scale-110 transition-transform">➕</span>
            <span className="text-xs font-semibold text-gray-700">Add Student</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all group">
            <span className="text-xl mb-1 transform group-hover:scale-110 transition-transform">📝</span>
            <span className="text-xs font-semibold text-gray-700">Mark Attendance</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all group">
            <span className="text-xl mb-1 transform group-hover:scale-110 transition-transform">🏆</span>
            <span className="text-xs font-semibold text-gray-700">Upload Grades</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all group">
            <span className="text-xl mb-1 transform group-hover:scale-110 transition-transform">📢</span>
            <span className="text-xs font-semibold text-gray-700">Post Notice</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Panels Grid Array Stack Segment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance & Result Framework Performance Overviews */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-base font-bold text-gray-900 mb-2">Attendance Metrics Summary</h4>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '94%' }}></div>
            </div>
            <p className="text-sm text-gray-600">Average terminal attendance status across active cohorts sits stably at <strong className="text-blue-600">94.2%</strong> this week.</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-base font-bold text-gray-900 mb-2">Grades Evaluation Overview</h4>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82%' }}></div>
            </div>
            <p className="text-sm text-gray-600">Target cohort pass criteria threshold matches expectations at an average performance score of <strong className="text-emerald-600">82.7%</strong>.</p>
          </div>
        </div>

        {/* Audit Log Activity Stream Component Block */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-base font-bold text-gray-900 mb-4">Recent System Logs</h4>
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivities.map((activity, idx) => (
                <li key={activity.id}>
                  <div className="relative pb-6">
                    {idx !== recentActivities.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-sm">
                          ⚙️
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-1.5">
                        <p className="text-xs text-gray-800 font-medium">{activity.action}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default TeacherDashboard;
