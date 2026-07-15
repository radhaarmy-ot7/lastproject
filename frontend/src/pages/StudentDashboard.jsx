import React, { useState, useEffect } from 'react';
import StudentSidebarLayout from '../components/StudentSidebarLayout';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();

  // Mock student tracking performance parameters matching requested requirements
  const [performance, setPerformance] = useState({
    attendancePercentage: 92.5,
    resultStatus: 'Passed',
    overallPercentage: 84.6,
    classTeacher: 'Pro. R. K. Verma',
    currentTerm: 'Final Term Evaluation'
  });

  return (
    <StudentSidebarLayout>
      {/* Header Profile Greeting Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome, {user?.name || 'Student'}</h2>
        <p className="text-gray-500 mt-1">Here is a summary of your academic parameters and attendance logs.</p>
      </div>

      {/* Metrics Performance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Attendance Summary Component Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Attendance Track</p>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg text-xl">📅</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{performance.attendancePercentage}%</h3>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${performance.attendancePercentage}%` }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Required threshold compliance: 75% minimum</p>
        </div>

        {/* Score Percentage Component Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Overall Grade Score</p>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg text-xl">📈</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{performance.overallPercentage}%</h3>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-purple-600 rounded-full" style={{ width: `${performance.overallPercentage}%` }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Calculated aggregate across cumulative assignments</p>
        </div>

        {/* Result Status Component Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Term Performance Status</p>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg text-xl">🏆</span>
          </div>
          <h3 className="text-3xl font-bold text-emerald-600">{performance.resultStatus}</h3>
          <div className="mt-4 pt-2 flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              Eligible for Promotion
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Status generated: {performance.currentTerm}</p>
        </div>
      </div>

      {/* Classroom Context Metadata Overview */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="text-base font-bold text-gray-900 mb-4">Registration Overview Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-xs text-gray-400 font-medium block uppercase tracking-wider">Admission Register ID</span>
            <span className="text-base font-bold text-gray-800">{user?.admission_number || 'N/A'}</span>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-xs text-gray-400 font-medium block uppercase tracking-wider">Class Cohort Assigned</span>
            <span className="text-base font-bold text-gray-800">{user?.class || 'Assigned General Class'}</span>
          </div>
        </div>
      </div>
    </StudentSidebarLayout>
  );
};

export default StudentDashboard;