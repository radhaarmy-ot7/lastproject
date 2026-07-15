import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('kv_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('kv_token') || null);
  const [loading, setLoading] = useState(false);

  const loginTeacher = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('kv_user', JSON.stringify(userData));
    localStorage.setItem('kv_token', userToken);
  };

  const loginStudent = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('kv_user', JSON.stringify(userData));
    localStorage.setItem('kv_token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('kv_user');
    localStorage.removeItem('kv_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, setLoading, loginTeacher, loginStudent, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
