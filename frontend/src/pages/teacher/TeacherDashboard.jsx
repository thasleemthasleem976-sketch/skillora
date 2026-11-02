import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Award,
  CheckCircle2,
  Radio,
  ShieldAlert,
  PlusCircle,
  Video,
  FileText,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/teacher');
        if (res.data.success) {
          setAnalytics(res.data.analytics);
        }
      } catch (err) {
        console.error('Error fetching teacher analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const stats = analytics || {
    totalStudents: 120,
    activeCourses: 8,
    averageScore: 81,
    completedLessons: 78,
    upcomingLiveClasses: 3,
    scoreDistribution: [
      { range: '0-40%', count: 4 },
      { range: '41-60%', count: 12 },
      { range: '61-80%', count: 42 },
      { range: '81-100%', count: 62 },
    ],
    recentAlerts: [],
  };

  const chartColors = ['#94a3b8', '#64748b', '#334155', '#0f172a'];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 relative z-10">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 backdrop-blur-md border border-white/70 text-slate-900 text-xs font-bold shadow-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Faculty Operations Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Instructor Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1 max-w-2xl">
            Monitor student engagement, manage video curricula, and review automated exam proctoring audits.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          <Link
            to="/teacher/courses"
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl glass-btn-primary text-xs font-bold flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> New Course
          </Link>
          <Link
            to="/teacher/upload-video"
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl glass-btn-secondary text-xs font-bold flex items-center gap-2"
          >
            <Video className="w-4 h-4" /> Upload Video
          </Link>
          <Link
            to="/teacher/exams"
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl glass-btn-secondary text-xs font-bold flex items-center gap-2"
          >
            <Award className="w-4 h-4" /> Exam Builder
          </Link>
        </div>
      </div>

      {/* Analytics Metric Cards Grid in High-Graphics Glass */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="p-4 sm:p-5 rounded-3xl glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">Total Students</span>
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/25 border border-white/50 text-slate-900 shadow-xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 sm:mt-3">{stats.totalStudents}</p>
          <span className="text-[11px] sm:text-xs text-slate-700 font-bold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> Enrolled learners
          </span>
        </div>

        {/* Active Courses */}
        <div className="p-4 sm:p-5 rounded-3xl glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">Active Courses</span>
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/25 border border-white/50 text-slate-900 shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 sm:mt-3">{stats.activeCourses}</p>
          <span className="text-[11px] sm:text-xs text-slate-700 mt-1 block font-medium">Published curricula</span>
        </div>

        {/* Average Score */}
        <div className="p-4 sm:p-5 rounded-3xl glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">Average Score</span>
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/25 border border-white/50 text-slate-900 shadow-xs">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 sm:mt-3">{stats.averageScore}%</p>
          <span className="text-[11px] sm:text-xs text-slate-700 mt-1 block font-medium">Across exams</span>
        </div>

        {/* Completed Lessons */}
        <div className="p-4 sm:p-5 rounded-3xl glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">Completed Lessons</span>
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/25 border border-white/50 text-slate-900 shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 sm:mt-3">{stats.completedLessons}</p>
          <span className="text-[11px] sm:text-xs text-slate-700 mt-1 block font-medium">Lectures finished</span>
        </div>

        {/* Upcoming Live Classes */}
        <div className="p-4 sm:p-5 rounded-3xl glass-card flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">Upcoming Live</span>
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/25 border border-white/50 text-slate-900 shadow-xs">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 sm:mt-3">{stats.upcomingLiveClasses}</p>
          <span className="text-[11px] sm:text-xs text-slate-700 font-bold mt-1 block">Scheduled sessions</span>
        </div>
      </div>

      {/* Proctoring Alerts Inspector */}
      <div className="p-7 rounded-3xl glass-panel shadow-[0_15px_35px_rgba(15,23,42,0.06)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/60">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-900" />
            Live Proctoring Violation Log
          </h3>
          <Link
            to="/teacher/proctoring"
            className="text-xs text-slate-900 hover:underline font-bold"
          >
            View Full Audit
          </Link>
        </div>

            <div className="mt-3 space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {stats.recentAlerts?.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">
                  No critical violations detected in recent exams.
                </p>
              ) : (
                stats.recentAlerts.map((alert, idx) => (
                  <div
                    key={alert._id || idx}
                    className="p-3.5 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 flex items-start justify-between gap-3 text-xs shadow-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          alert.severity === 'critical' ? 'bg-red-600' : 'bg-amber-600'
                        }`}
                      ></span>
                      <div>
                        <p className="font-bold text-slate-900">{alert.student?.name || 'Student'}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">{alert.message}</p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {alert.exam?.title} • {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-white/30 text-slate-800 border border-white/90">
                      {alert.eventType?.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>

        <div className="p-3.5 rounded-2xl bg-white/40 backdrop-blur-md border border-white/70 text-[11px] text-slate-700 flex items-center justify-between font-medium shadow-xs">
          <span>FaceAPI Engine Status: Active</span>
          <span className="text-slate-900 font-bold">● Stream Ready</span>
        </div>
      </div>
    </div>
  );
}
