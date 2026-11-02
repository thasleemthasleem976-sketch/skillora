import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Award,
  ShieldAlert,
  Server,
  Activity,
  UserCheck,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/analytics/admin');
        if (res.data.success) {
          setAnalytics(res.data.analytics);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  const stats = analytics || {
    totalStudents: 142,
    totalTeachers: 12,
    totalCourses: 18,
    totalExams: 9,
    totalExamAttempts: 64,
    totalProctoringAlerts: 14,
    enrollmentTrends: [
      { month: 'Jun', students: 68, exams: 35 },
      { month: 'Jul', students: 90, exams: 52 },
      { month: 'Aug', students: 130, exams: 78 },
      { month: 'Sep', students: 165, exams: 110 },
      { month: 'Oct', students: 210, exams: 145 },
    ],
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Platform Administration</h1>
          <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1">
            Global governance, academic integrity audits, user control, and course/quiz management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/courses"
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl glass-btn-primary text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Manage Courses & Quizzes</span>
          </Link>
          <Link
            to="/admin/users"
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl glass-btn-secondary text-xs font-bold transition-all"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/proctoring"
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl glass-btn-secondary text-xs font-bold transition-all"
          >
            Proctoring Audit
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="p-4 sm:p-5 rounded-3xl glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">Total Students</span>
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/25 border border-white/50 text-slate-900 shadow-xs">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 sm:mt-3">{stats.totalStudents}</p>
          <span className="text-[11px] sm:text-xs text-slate-700 font-semibold mt-1 block">Active learners</span>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">Teachers</span>
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/25 border border-white/50 text-slate-900 shadow-xs">
              <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 sm:mt-3">{stats.totalTeachers}</p>
          <span className="text-[11px] sm:text-xs text-slate-700 font-semibold mt-1 block">Course creators</span>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">Courses</span>
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/25 border border-white/50 text-slate-900 shadow-xs">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 sm:mt-3">{stats.totalCourses}</p>
          <span className="text-[11px] sm:text-xs text-slate-700 font-semibold mt-1 block">Active in catalog</span>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">Alerts</span>
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/25 border border-white/50 text-slate-900 shadow-xs">
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 sm:mt-3">{stats.totalProctoringAlerts}</p>
          <span className="text-[11px] sm:text-xs text-slate-700 font-semibold mt-1 block">Proctoring logs</span>
        </div>
      </div>

      {/* Admin Feature Banner: Course & Quiz Creation Notice */}
      <div className="p-7 rounded-3xl glass-panel-dark text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Admin Academic Authority</span>
          <h2 className="text-xl font-black mt-1">Course & Student Quiz Management</h2>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl leading-relaxed">
            As administrator, you have full capability to create courses and build all student quizzes with timed MCQs, passing criteria, and instant automated grading.
          </p>
        </div>
        <Link
          to="/admin/courses"
          className="px-6 py-3 rounded-2xl bg-white text-black text-xs font-black hover:bg-gray-100 transition-all flex items-center gap-2 shrink-0 shadow-[0_10px_25px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95"
        >
          <span>Open Course & Quiz Creator</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
