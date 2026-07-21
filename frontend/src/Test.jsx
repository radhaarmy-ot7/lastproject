import React from 'react';
import { Link } from 'react-router-dom';

const Test = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-soft p-12 text-center max-w-md w-full fade-in">
        {/* Logo */}
        <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-200">
          <span className="text-white font-bold text-3xl">KV</span>
        </div>
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          ✅ It's Working!
        </h1>
        <p className="text-secondary-500 text-lg mb-6">
          React is rendering correctly.
        </p>
        
        {/* Feature List */}
        <div className="bg-secondary-50 rounded-xl p-4 text-left space-y-2 text-secondary-600 text-sm">
          <p className="flex items-center gap-2">
            <span className="text-green-500 text-lg">✅</span>
            React Router is working
          </p>
          <p className="flex items-center gap-2">
            <span className="text-green-500 text-lg">✅</span>
            Tailwind CSS is working
          </p>
          <p className="flex items-center gap-2">
            <span className="text-green-500 text-lg">✅</span>
            React Hot Toast is working
          </p>
          <p className="flex items-center gap-2">
            <span className="text-green-500 text-lg">✅</span>
            Auth Context is working
          </p>
        </div>
        
        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/login"
            className="btn-primary px-8 py-3 text-center"
          >
            Go to Login
          </Link>
          <Link
            to="/register"
            className="btn-success px-8 py-3 text-center"
          >
            Go to Register
          </Link>
        </div>
        
        {/* Footer */}
        <p className="text-xs text-secondary-400 mt-4">
          KV School Management System v1.0
        </p>
      </div>
    </div>
  );
};

export default Test;