import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Award,
  Radio,
  Play,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrollRes, liveRes, examRes] = await Promise.all([
          api.get('/enrollments/my-courses'),
          api.get('/live-classes'),
          api.get('/exams'),
        ]);

        if (enrollRes.data.success) setEnrollments(enrollRes.data.enrollments);
        if (liveRes.data.success) setLiveClasses(liveRes.data.liveClasses);
        if (examRes.data.success) setExams(examRes.data.exams);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeEnrollment = enrollments[0];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 relative z-10">
      {/* Welcome Banner with Liquid Glass Effect */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.95)]">
        {/* Subtle Liquid Shimmer Layer */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-gradient-to-br from-white/60 to-transparent filter blur-3xl opacity-60 pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-white/70 text-slate-900 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <Sparkles className="w-4 h-4 text-black" />
            <span>AI-Proctored Liquid Learning Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
            Resume your video lessons with HTTP partial streaming, attend scheduled live classes with interactive video, and prepare for your AI-proctored online assessments.
          </p>

          {activeEnrollment && (
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                to={`/course-view/${activeEnrollment.course?._id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl glass-btn-primary font-bold text-xs shadow-md"
              >
                <Play className="w-4 h-4 fill-white" />
                Resume: {activeEnrollment.course?.title}
              </Link>
              <span className="text-xs text-slate-700 font-bold px-3 py-1.5 rounded-xl bg-white/40 backdrop-blur-md border border-white/70">
                {activeEnrollment.progressPercentage}% completed
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Metric Cards in High-Graphics Glass */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="p-4 sm:p-5 rounded-3xl glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">Enrolled Courses</span>
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/25 text-slate-900 shadow-xs border border-white/50">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 sm:mt-3">{enrollments.length}</p>
          <p className="text-[11px] sm:text-xs text-slate-700 mt-1 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Active curriculum
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">Live Classes</span>
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/25 text-slate-900 shadow-xs border border-white/50">
              <Radio className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 sm:mt-3">{liveClasses.length}</p>
          <p className="text-[11px] sm:text-xs text-slate-700 mt-1 font-semibold">WebRTC sessions</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">Online Exams</span>
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/25 text-slate-900 shadow-xs border border-white/50">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 sm:mt-3">{exams.length}</p>
          <p className="text-[11px] sm:text-xs text-slate-700 mt-1 font-semibold">AI-Proctored</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">Completed Lessons</span>
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/25 text-slate-900 shadow-xs border border-white/50">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 sm:mt-3">
            {enrollments.reduce((acc, e) => acc + (e.completedLessons?.length || 0), 0)}
          </p>
          <p className="text-[11px] sm:text-xs text-slate-700 mt-1 font-semibold">Lectures finished</p>
        </div>
      </div>

      {/* Main Grid: My Courses & Upcoming Live Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Enrolled Courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">In-Progress Courses</h2>
            <Link to="/courses" className="text-xs font-bold text-gray-700 hover:text-black flex items-center gap-1">
              Explore More <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="p-8 rounded-3xl glass-card text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-800 text-sm font-bold">No courses enrolled yet</p>
              <p className="text-xs text-gray-500 mt-1">Browse our rich catalog and enroll in your first course.</p>
              <Link
                to="/courses"
                className="mt-4 inline-block px-5 py-2.5 glass-btn-primary rounded-2xl text-xs font-bold"
              >
                Browse Catalog
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.map((item) => (
                <div
                  key={item._id}
                  className="p-5 rounded-3xl glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.course?.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300'}
                      alt={item.course?.title}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-white/80 shadow-xs"
                    />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-white/30 border border-white/90 text-gray-800 shadow-xs">
                        {item.course?.category || 'Tech'}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mt-1">{item.course?.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Instructor: {item.course?.instructor?.name || 'Prof. David Vance'}
                      </p>
                    </div>
                  </div>

                  <div className="w-full sm:w-48 shrink-0 space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-gray-700">
                      <span>Progress</span>
                      <span>{item.progressPercentage}%</span>
                    </div>
                    {/* Animated Shimmering Liquid Progress Bar */}
                    <div className="w-full h-2.5 bg-gray-200/80 rounded-full overflow-hidden p-0.5 border border-white/60">
                      <div
                        className="h-full bg-gradient-to-r from-gray-900 to-black rounded-full transition-all relative overflow-hidden"
                        style={{ width: `${item.progressPercentage}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-liquid-pulse" />
                      </div>
                    </div>
                    <Link
                      to={`/course-view/${item.course?._id}`}
                      className="block text-center w-full py-2 glass-btn-secondary rounded-xl text-xs font-bold transition-all"
                    >
                      Continue
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Live Class Schedule & Exams */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Live Classes</h2>
            <div className="space-y-3">
              {liveClasses.length === 0 ? (
                <div className="p-6 rounded-3xl glass-card text-center text-xs text-gray-500">
                  No upcoming live classes right now.
                </div>
              ) : (
                liveClasses.slice(0, 3).map((cls) => (
                  <div
                    key={cls._id}
                    className="p-4 rounded-3xl glass-card space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                        {cls.status}
                      </span>
                      <span className="text-[11px] text-gray-500 font-mono">
                        {cls.durationMinutes || 60}m
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{cls.title}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        By {cls.instructor?.name || 'Faculty Lead'}
                      </p>
                    </div>

                    <Link
                      to="/live-classes"
                      className="block text-center w-full py-2 glass-btn-primary rounded-xl text-xs font-bold"
                    >
                      Join Live Classroom
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Proctored Examinations</h2>
            <div className="p-5 rounded-3xl glass-card space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-black text-white shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Automated Proctoring Active</h4>
                  <p className="text-[11px] text-gray-500">Real-time FaceAPI detection & tab switch logging</p>
                </div>
              </div>
              <Link
                to="/exams"
                className="block text-center w-full py-2.5 glass-btn-secondary rounded-xl text-xs font-bold"
              >
                View Available Exams
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
