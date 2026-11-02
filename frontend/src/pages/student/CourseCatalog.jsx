import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, BookOpen, Star, Clock, CheckCircle2, User, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [enrollingId, setEnrollingId] = useState(null);
  const { triggerToastAlert } = useNotifications();
  const navigate = useNavigate();

  const categories = ['All', 'Computer Science', 'Artificial Intelligence', 'DevOps & Cloud'];

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses', {
        params: {
          search: search || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
        },
      });
      if (res.data.success) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [search, selectedCategory]);

  const handleEnroll = async (courseId) => {
    try {
      setEnrollingId(courseId);
      const res = await api.post(`/enrollments/enroll/${courseId}`);
      if (res.data.success) {
        triggerToastAlert('Successfully enrolled in course!', 'info');
        navigate(`/course-view/${courseId}`);
      }
    } catch (err) {
      triggerToastAlert(err.response?.data?.message || 'Enrollment confirmed', 'info');
      navigate(`/course-view/${courseId}`);
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 relative z-10">
      {/* Header with Glass Capsule */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 backdrop-blur-md border border-white/70 text-slate-900 text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-black" />
          <span>Liquid Curriculum & Assessments</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Explore Course Catalog</h1>
        <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-3xl leading-relaxed">
          Advance your engineering expertise through high-definition video modules, real-time code projects, quizzes, and proctored online examinations.
        </p>
      </div>

      {/* Filter and Search Bar in Frosted Glass Container */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-3xl glass-panel shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
        {/* Category Pills - Smooth Touch Row Without Altering Alignment */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-[0_4px_14px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.3)]'
                  : 'bg-white/20 text-slate-800 hover:text-black hover:bg-white/35 border border-white/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input - Clean Alignment */}
        <div className="relative w-full sm:w-64 md:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/20 backdrop-blur-md border border-white/50 rounded-2xl text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:bg-white/40 focus:border-black/50 shadow-xs font-medium"
          />
        </div>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-3xl glass-panel border border-white/60 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-md border border-white/50 mx-auto flex items-center justify-center text-slate-900 shadow-xs">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900">No Courses Available Yet</h3>
          <p className="text-xs text-slate-800 max-w-md mx-auto font-medium leading-relaxed">
            All sample data has been cleared. Log in as an Admin or Teacher using the sample login entries to publish new courses and student quizzes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="group rounded-3xl glass-card flex flex-col justify-between overflow-hidden"
            >
            {/* Thumbnail with Glass Reflection */}
            <div className="relative aspect-video overflow-hidden border-b border-white/50">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 pointer-events-none" />
              
              <div className="absolute top-3 left-3 bg-white/30 backdrop-blur-md px-3 py-1 rounded-xl border border-white/90 text-[10px] font-bold uppercase tracking-wider text-gray-900 shadow-xs">
                {course.level}
              </div>
              <div className="absolute top-3 right-3 bg-white/30 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/90 text-[11px] font-bold text-gray-900 flex items-center gap-1 shadow-xs">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-500" />
                <span>{course.rating || 4.9}</span>
              </div>
            </div>

            {/* Course Body */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  {course.category}
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1 line-clamp-1 group-hover:text-black transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Footer details */}
              <div className="space-y-4 pt-3 border-t border-gray-200/50">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <img
                      src={course.instructor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt="Instructor"
                      className="w-5 h-5 rounded-full object-cover border border-white/80"
                    />
                    <span className="truncate max-w-[120px] text-gray-800 font-medium">
                      {course.instructor?.name || 'Instructor'}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 font-medium">
                    <BookOpen className="w-3.5 h-3.5" />
                    {course.lessons?.length || 0} Lessons
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-lg font-black text-gray-900">
                    {course.price > 0 ? `$${course.price}` : 'Free'}
                  </span>
                  <button
                    onClick={() => handleEnroll(course._id)}
                    disabled={enrollingId === course._id}
                    className="px-5 py-2.5 glass-btn-primary rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {enrollingId === course._id ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
}
