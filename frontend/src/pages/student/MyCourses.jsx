import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Play, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import api from '../../services/api';

export default function MyCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await api.get('/enrollments/my-courses');
        if (res.data.success) {
          setEnrollments(res.data.enrollments);
        }
      } catch (err) {
        console.error('Error fetching enrollments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading your enrolled courses...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative z-10">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-slate-800 text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Active Learning Journey</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Courses</h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Track your course completion, resume video lessons from your saved timestamp, and review quizzes.
        </p>
      </div>

      {enrollments.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-card space-y-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No enrolled courses</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You have not enrolled in any courses yet. Browse our library of modern video courses.
          </p>
          <Link
            to="/courses"
            className="inline-block px-6 py-3 rounded-2xl glass-btn-primary text-xs font-bold"
          >
            Browse Course Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((item) => (
            <div
              key={item._id}
              className="rounded-3xl glass-card overflow-hidden shadow-[0_15px_35px_rgba(15,23,42,0.06)] flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video overflow-hidden border-b border-white/50">
                  <img
                    src={item.course?.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400'}
                    alt={item.course?.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 bg-white/85 backdrop-blur-md px-3 py-1 rounded-xl border border-white/90 text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-xs">
                    {item.course?.category || 'Tech'}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1 mt-1">{item.course?.title}</h3>
                  <p className="text-xs text-slate-500">
                    Instructor: {item.course?.instructor?.name || 'Prof. David Vance'}
                  </p>

                  {/* Progress bar with animated liquid shimmer */}
                  <div className="pt-2 space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Completion</span>
                      <span className="font-bold text-slate-900">{item.progressPercentage}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5 border border-white/60">
                      <div
                        className="h-full bg-gradient-to-r from-slate-900 to-black rounded-full transition-all relative overflow-hidden"
                        style={{ width: `${item.progressPercentage}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-liquid-pulse" />
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 block font-medium">
                      {item.completedLessons?.length || 0} of {item.course?.lessons?.length || 0} lessons completed
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  to={`/course-view/${item.course?._id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl glass-btn-primary text-xs font-bold"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Continue Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
