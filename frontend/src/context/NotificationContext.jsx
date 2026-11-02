import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeAlert, setActiveAlert] = useState(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      // ignore
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      // ignore
    }
  };

  const triggerToastAlert = (message, severity = 'warning', timeout = 4000) => {
    setActiveAlert({ message, severity, id: Date.now() });
    setTimeout(() => {
      setActiveAlert(null);
    }, timeout);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        activeAlert,
        triggerToastAlert,
      }}
    >
      {children}
      {/* Toast Alert Banner */}
      {activeAlert && (
        <div className="fixed top-6 right-6 z-50 max-w-md animate-bounce">
          <div
            className={`flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md ${
              activeAlert.severity === 'critical'
                ? 'bg-red-500/90 border-red-400 text-white shadow-red-500/20'
                : 'bg-amber-500/90 border-amber-400 text-white shadow-amber-500/20'
            }`}
          >
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-sm tracking-wide uppercase">Proctoring Notice</p>
              <p className="text-sm mt-0.5 font-medium leading-relaxed">{activeAlert.message}</p>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
