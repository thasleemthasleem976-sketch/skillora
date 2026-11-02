import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  Video,
  Radio,
  FileText,
  HelpCircle,
  ShieldAlert,
  Users,
  Settings,
  FolderPlus,
  Award,
  CheckCircle2,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen = false, onClose }) {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role || 'student';

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/courses', label: 'Browse Courses', icon: BookOpen },
    { to: '/my-courses', label: 'My Courses', icon: CheckCircle2 },
    { to: '/live-classes', label: 'Live Classes', icon: Radio },
    { to: '/assignments', label: 'Assignments', icon: FileText },
    { to: '/quizzes', label: 'Quizzes', icon: HelpCircle },
    { to: '/exams', label: 'Online Exams', icon: ShieldAlert, badge: 'Proctored' },
    { to: '/results', label: 'Exam Results', icon: Award },
  ];

  const teacherLinks = [
    { to: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/teacher/courses', label: 'Course Curriculum', icon: BookOpen },
    { to: '/teacher/upload-video', label: 'Upload Video', icon: Video },
    { to: '/teacher/live-classes', label: 'Live Classes', icon: Radio },
    { to: '/teacher/assignments', label: 'Assignments', icon: FileText },
    { to: '/teacher/quizzes', label: 'Quizzes', icon: HelpCircle },
    { to: '/teacher/exams', label: 'Exams & Builder', icon: ShieldAlert },
    { to: '/teacher/proctoring', label: 'Proctoring Logs', icon: ShieldAlert },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/courses', label: 'Courses & Quizzes', icon: Layers, badge: 'Quiz Admin' },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
    { to: '/admin/proctoring', label: 'Proctoring Audit', icon: ShieldAlert },
    { to: '/admin/settings', label: 'System Settings', icon: Settings },
  ];

  const links = role === 'admin' ? adminLinks : role === 'teacher' ? teacherLinks : studentLinks;

  const renderSidebarContent = (isMobile = false) => (
    <div className={`flex-1 ${isMobile ? "glass-dropdown" : "glass-panel"} flex flex-col overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.18),inset_0_1px_1.5px_rgba(255,255,255,0.95)] border border-white/80`}>
      {/* Brand Logo with Tactile Glass Tile */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/40">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center shadow-[0_8px_20px_-4px_rgba(15,23,42,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] relative overflow-hidden group">
            <BookOpen className="w-5 h-5 relative z-10" />
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <span className="font-black text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
              Skillora
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            </span>
            <span className="block text-xs font-semibold text-slate-700">
              Liquid Glass LMS
            </span>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/40 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Mini Role Pill */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/25 backdrop-blur-md border border-white/50 shadow-xs">
          <img
            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
            alt={user.name}
            className="w-10 h-10 rounded-xl object-cover border border-white/80 shadow-xs"
          />
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
            <span
              className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-md mt-0.5 ${
                role === 'admin'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : role === 'teacher'
                  ? 'bg-slate-200/80 text-slate-900 border border-white/50'
                  : 'bg-white/40 text-slate-800 border border-white/60'
              }`}
            >
              {role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links with Floating Glass Buttons */}
      <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {role === 'admin' ? 'Administration' : role === 'teacher' ? 'Instructor Portal' : 'Student Menu'}
        </div>
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (onClose) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-3 glass-nav-item text-xs font-semibold ${
                  isActive ? 'glass-nav-item-active font-bold' : 'text-slate-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 relative z-10">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-white/20 text-white shadow-xs'
                          : 'bg-white/25 text-slate-700 border border-white/50'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md relative z-10 ${
                        isActive
                          ? 'bg-white/30 text-white'
                          : 'bg-white/30 text-slate-900 border border-white/50'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="w-68 p-4 shrink-0 min-h-screen relative z-20 hidden lg:flex flex-col">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Slide-over Drawer with Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl transition-all duration-300"
            onClick={onClose}
          />
          {/* Drawer Capsule */}
          <div className="relative w-72 max-w-[85vw] h-full p-4 flex flex-col z-50 animate-in slide-in-from-left duration-200">
            {renderSidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
