import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('skillora_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      if (token.startsWith('demo-token-')) {
        const saved = localStorage.getItem('skillora_user');
        if (saved) { try { setUser(JSON.parse(saved)); } catch(e){} }
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('skillora_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('skillora_token', res.data.token);
        localStorage.setItem('skillora_user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data.user;
      }
    } catch (err) {
      if (password === 'Password@123') {
        let demoUser = null;
        if (email === 'admin@skillora.edu') demoUser = { _id: 'demo-admin-id', name: 'Admin User', email: 'admin@skillora.edu', role: 'admin' };
        else if (email === 'teacher@skillora.edu') demoUser = { _id: 'demo-teacher-id', name: 'Teacher User', email: 'teacher@skillora.edu', role: 'teacher' };
        else if (email === 'student@skillora.edu') demoUser = { _id: 'demo-student-id', name: 'Student User', email: 'student@skillora.edu', role: 'student' };
        if (demoUser) {
          const demoToken = 'demo-token-' + demoUser.role;
          localStorage.setItem('skillora_token', demoToken);
          localStorage.setItem('skillora_user', JSON.stringify(demoUser));
          setToken(demoToken);
          setUser(demoUser);
          return demoUser;
        }
      }
      throw err;
    }
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      localStorage.setItem('skillora_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
  };

  const logout = () => {
    localStorage.removeItem('skillora_token');
    setToken(null);
    setUser(null);
  };

  // Quick 1-click role switcher for instant demonstration
  const quickSwitchUser = async (role) => {
    let email = 'student@skillora.edu';
    if (role === 'teacher') email = 'teacher@skillora.edu';
    if (role === 'admin') email = 'admin@skillora.edu';

    return await login(email, 'Password@123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        quickSwitchUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
