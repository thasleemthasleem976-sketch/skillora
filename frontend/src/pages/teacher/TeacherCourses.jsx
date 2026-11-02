import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  PlusCircle,
  Edit2,
  Trash2,
  Video,
  FilePlus,
  X,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const { triggerToastAlert } = useNotifications();

  // New Course Form state
  const [courseForm, setCourseForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'Computer Science',
    level: 'Beginner',
    price: 0,
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
  });

  // New Lesson Form state
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    durationMinutes: 15,
    videoUrl: '/api/videos/stream/react-components.mp4',
    isFreePreview: false,
  });

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses/teacher/my-courses');
      if (res.data.success) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      if (selectedCourse?._id) {
        // Edit course
        await api.put(`/courses/${selectedCourse._id}`, courseForm);
        triggerToastAlert('Course updated successfully', 'info');
      } else {
        // Create course
        await api.post('/courses', courseForm);
        triggerToastAlert('Course created successfully', 'info');
      }
      setShowCourseModal(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (err) {
      triggerToastAlert('Failed to save course', 'warning');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course and all its lessons?')) return;
    try {
      await api.delete(`/courses/${courseId}`);
      triggerToastAlert('Course deleted', 'info');
      fetchCourses();
    } catch (err) {
      triggerToastAlert('Failed to delete course', 'warning');
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      await api.post('/lessons', {
        ...lessonForm,
        courseId: selectedCourse._id,
      });
      triggerToastAlert('Lesson added to course successfully!', 'info');
      setShowLessonModal(false);
      fetchCourses();
    } catch (err) {
      triggerToastAlert('Failed to add lesson', 'warning');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Course Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Build, publish, and curate your video courses and curriculum lessons.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedCourse(null);
            setCourseForm({
              title: '',
              subtitle: '',
              description: '',
              category: 'Computer Science',
              level: 'Beginner',
              price: 0,
              thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
            });
            setShowCourseModal(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Create New Course
        </button>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        {courses.map((course) => (
          <div
            key={course._id}
            className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div className="flex items-center gap-5">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-gray-200"
              />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-800 border border-gray-200">
                  {course.category} • {course.level}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">{course.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {course.lessons?.length || 0} Lessons • {course.enrolledCount || 0} Enrolled Students • Rating {course.rating || 4.9}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => {
                  setSelectedCourse(course);
                  setLessonForm({
                    title: '',
                    description: '',
                    durationMinutes: 15,
                    videoUrl: '/api/videos/stream/react-components.mp4',
                    isFreePreview: false,
                  });
                  setShowLessonModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-black hover:text-white text-gray-800 text-xs font-bold transition-all border border-gray-300 flex items-center gap-1.5"
              >
                <FilePlus className="w-4 h-4" /> Add Lesson
              </button>

              <button
                onClick={() => {
                  setSelectedCourse(course);
                  setCourseForm({
                    title: course.title,
                    subtitle: course.subtitle || '',
                    description: course.description,
                    category: course.category,
                    level: course.level,
                    price: course.price,
                    thumbnail: course.thumbnail,
                  });
                  setShowCourseModal(true);
                }}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all border border-gray-300"
                title="Edit Course"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDeleteCourse(course._id)}
                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all border border-red-200"
                title="Delete Course"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white border border-gray-300 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900">
                {selectedCourse ? 'Edit Course' : 'Create New Course'}
              </h3>
              <button
                onClick={() => setShowCourseModal(false)}
                className="text-gray-400 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                  placeholder="e.g. Modern Full-Stack React & Node.js"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                  placeholder="Explain curriculum outcomes..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Category</label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                  >
                    <option>Computer Science</option>
                    <option>Artificial Intelligence</option>
                    <option>DevOps & Cloud</option>
                    <option>Cybersecurity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Level</label>
                  <select
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Thumbnail Image URL</label>
                <input
                  type="text"
                  value={courseForm.thumbnail}
                  onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && selectedCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-gray-300 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <h3 className="text-base font-bold text-gray-900">Add Lesson</h3>
                <p className="text-xs text-gray-500">To {selectedCourse.title}</p>
              </div>
              <button
                onClick={() => setShowLessonModal(false)}
                className="text-gray-400 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Lesson Title</label>
                <input
                  type="text"
                  required
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                  placeholder="e.g. Asynchronous State Mutations"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={lessonForm.durationMinutes}
                    onChange={(e) => setLessonForm({ ...lessonForm, durationMinutes: parseInt(e.target.value) })}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Video Stream URL</label>
                  <input
                    type="text"
                    required
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                    placeholder="/api/videos/stream/react-components.mp4"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="previewCheckTeacher"
                  checked={lessonForm.isFreePreview}
                  onChange={(e) => setLessonForm({ ...lessonForm, isFreePreview: e.target.checked })}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <label htmlFor="previewCheckTeacher" className="text-xs text-gray-700">
                  Allow Free Preview for this lesson
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold"
                >
                  Add Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
