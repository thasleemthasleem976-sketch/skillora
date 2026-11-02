import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ShieldCheck, LogOut, User as UserIcon, Check, Sparkles, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <>
      {/* Blurred Backdrop for Dropdowns & Menus */}
      {(showNotifications || showProfileMenu) && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/25 backdrop-blur-sm transition-opacity"
          onClick={() => {
            setShowNotifications(false);
            setShowProfileMenu(false);
          }}
        />
      )}
    <header className="px-3 sm:px-6 pt-3 sm:pt-4 pb-2 sticky top-0 z-40">
      {/* Floating Liquid Glass Topbar */}
      <div className="h-16 glass-panel px-3 sm:px-6 flex items-center justify-between border border-white/60 shadow-[0_12px_30px_rgba(15,23,42,0.05),inset_0_1px_1.5px_rgba(255,255,255,0.90)]">
        {/* Left section: Mobile Menu Toggle + Status Badge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 sm:p-2.5 rounded-2xl glass-btn-secondary text-slate-800 hover:text-black flex items-center justify-center shrink-0"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-white/25 backdrop-blur-md border border-white/50 text-slate-900 text-xs font-bold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-900 shrink-0" />
            <span className="hidden sm:inline">Skillora Liquid AI Proctor & Cloud</span>
            <span className="sm:hidden font-black">Skillora</span>
          </div>
        </div>

        {/* Right section: Active Role Badge + Notifications + Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Active User Role Badge */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-white/25 backdrop-blur-md rounded-2xl border border-white/50 shadow-xs text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
              {user.role} Portal
            </span>
          </div>

          {/* Notifications Dropdown (Frosted Glass Button & Popover) */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 sm:p-3 rounded-2xl glass-btn-secondary text-slate-700 hover:text-slate-900 transition-all flex items-center justify-center"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-slate-900 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-72 sm:w-84 glass-dropdown rounded-3xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-white/40">
                  <span className="text-xs font-black text-slate-900">Notifications ({unreadCount} new)</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-slate-600 hover:text-slate-900 font-bold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => markAsRead(n._id)}
                        className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                          n.isRead
                            ? 'bg-white/20 border-white/40 text-slate-600'
                            : 'bg-white/40 border-white/60 text-slate-900 font-medium shadow-xs'
                        }`}
                      >
                        <p className="font-bold text-slate-900">{n.title}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar & Menu (Frosted Glass) */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 sm:p-1.5 sm:pr-3 rounded-2xl glass-btn-secondary transition-all"
            >
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                alt={user.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-cover border border-white/70 shadow-xs"
              />
              <span className="text-xs font-bold text-slate-800 hidden md:inline-block max-w-[100px] truncate">
                {user.name}
              </span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-60 glass-dropdown rounded-3xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-2.5 border-b border-slate-200/80 bg-slate-50/80 rounded-2xl mb-1.5 shadow-xs">
                  <p className="text-xs font-bold text-slate-900">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                </div>
                <div className="mt-1 space-y-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800 hover:text-slate-900 hover:bg-slate-100/90 transition-all"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    Profile & Settings
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50/90 font-bold transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
    </>
  );
}
