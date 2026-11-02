import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle,
  PlayCircle,
  Clock,
  ArrowLeft,
  Download,
  ExternalLink,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import api from '../../services/api';
import VideoPlayer from '../../components/video/VideoPlayer';
import { useNotifications } from '../../context/NotificationContext';

export default function CourseViewer() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const { triggerToastAlert } = useNotifications();

  const fetchCourseData = async () => {
    try {
      const [courseRes, enrollRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/enrollments/course/${id}`),
      ]);

      if (courseRes.data.success) {
        setCourse(courseRes.data.course);
        const lessons = courseRes.data.course.lessons || [];

        // Check if student has enrollment
        if (enrollRes.data.success && enrollRes.data.enrollment) {
          setEnrollment(enrollRes.data.enrollment);

          // Find last accessed lesson or default to first
          const lastId = enrollRes.data.enrollment.lastAccessedLesson;
          const matched = lessons.find((l) => l._id === lastId);
          setActiveLesson(matched || lessons[0] || null);
        } else {
          setActiveLesson(lessons[0] || null);
        }
      }
    } catch (err) {
      console.error('Error loading course viewer:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const handleLessonSelect = (lesson) => {
    setActiveLesson(lesson);
  };

  const handleToggleComplete = async (lessonId) => {
    try {
      const res = await api.put('/enrollments/toggle-lesson', {
        courseId: id,
        lessonId,
      });
      if (res.data.success) {
        setEnrollment((prev) => ({
          ...prev,
          completedLessons: res.data.completedLessons,
          progressPercentage: res.data.progressPercentage,
        }));
        triggerToastAlert('Lesson progress updated!', 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500">
        Loading classroom streaming environment...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-12 text-center text-red-600 font-bold">
        Course not found or failed to load.
      </div>
    );
  }

  // Lookup saved resume timestamp for this lesson
  let savedTimestamp = 0;
  if (enrollment && enrollment.videoPlaybackState && activeLesson) {
    const state = enrollment.videoPlaybackState[activeLesson._id];
    if (state && state.currentTime) {
      savedTimestamp = state.currentTime;
    }
  }

  const isCompleted = (lessonId) => {
    return enrollment?.completedLessons?.some(
      (id) => (typeof id === 'string' ? id : id._id) === lessonId
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {enrollment && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600">Course Completion:</span>
            <span className="text-xs font-black text-gray-900">{enrollment.progressPercentage}%</span>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-black rounded-full"
                style={{ width: `${enrollment.progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Main Layout: Video on Left, Lessons Curriculum on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Video Player & Lesson Details */}
        <div className="lg:col-span-2 space-y-5">
          {activeLesson ? (
            <div className="space-y-4">
              <VideoPlayer
                src={activeLesson.videoUrl || activeLesson.video?.url || '/api/videos/stream/react-components.mp4'}
                courseId={course._id}
                lessonId={activeLesson._id}
                initialTimestamp={savedTimestamp}
                title={activeLesson.title}
                onEnded={() => handleToggleComplete(activeLesson._id)}
              />

              <div className="p-6 rounded-3xl glass-card space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-xl bg-white/30 border border-white/90 text-gray-800 shadow-xs">
                      Lesson {activeLesson.order} • {activeLesson.durationMinutes} Minutes
                    </span>
                    <h2 className="text-xl font-black text-gray-900 mt-3">{activeLesson.title}</h2>
                  </div>

                  <button
                    onClick={() => handleToggleComplete(activeLesson._id)}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                      isCompleted(activeLesson._id)
                        ? 'glass-btn-secondary'
                        : 'glass-btn-primary'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isCompleted(activeLesson._id) ? 'Completed' : 'Mark as Complete'}
                  </button>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {activeLesson.description || 'No description provided for this lesson.'}
                </p>

                {/* Lesson Resources */}
                {activeLesson.resources && activeLesson.resources.length > 0 && (
                  <div className="pt-4 border-t border-gray-200/50 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Lesson Resources & References
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeLesson.resources.map((res, i) => (
                        <a
                          key={i}
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/30 hover:bg-white text-gray-800 text-xs font-bold border border-white/90 transition-all shadow-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{res.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 rounded-2xl bg-white border border-gray-200">
              No lesson selected.
            </div>
          )}
        </div>

        {/* Right Column: Lessons Curriculum List */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl glass-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200/50">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-black" />
                Course Curriculum
              </h3>
              <span className="text-xs text-gray-500 font-mono">
                {course.lessons?.length || 0} Lessons
              </span>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {course.lessons?.map((lesson, idx) => {
                const isActive = activeLesson?._id === lesson._id;
                const completed = isCompleted(lesson._id);

                return (
                  <div
                    key={lesson._id}
                    onClick={() => handleLessonSelect(lesson)}
                    className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-black text-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] font-bold'
                        : 'bg-white/60 border-white/80 text-gray-700 hover:bg-white hover:border-white hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                          completed
                            ? isActive ? 'bg-white/20 text-white' : 'bg-black/10 text-gray-900 border border-black/10'
                            : isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-black/5 text-gray-600'
                        }`}
                      >
                        {completed ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                      </div>

                      <div className="overflow-hidden">
                        <p className={`font-bold truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>
                          {lesson.title}
                        </p>
                        <span className={`text-[10px] flex items-center gap-1 mt-0.5 ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                          <Clock className="w-3 h-3" /> {lesson.durationMinutes || 10} min
                        </span>
                      </div>
                    </div>

                    {lesson.isFreePreview && (
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-black/5 text-gray-700'
                      }`}>
                        Preview
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
