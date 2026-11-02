import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  PlusCircle,
  HelpCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  FilePlus,
  Clock,
  Plus,
  Layers,
  Award,
  ChevronRight,
  Eye,
} from 'lucide-react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [managingQuizzesForCourse, setManagingQuizzesForCourse] = useState(null);
  const { triggerToastAlert } = useNotifications();

  // Course Form
  const [courseForm, setCourseForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'Computer Science',
    level: 'Beginner',
    price: 0,
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    // Integrated quizzes created along with course
    createInitialQuiz: true,
    quizTitle: 'Course Comprehension Quiz',
    quizTimeLimit: 15,
    quizPassingPercentage: 60,
    quizQuestions: [
      {
        questionText: 'What is the primary concept covered in this curriculum?',
        options: [
          'Core foundational architecture and component design',
          'Operating system kernel compilation',
          'Low-level hardware register assembly',
          'Relational database disk partitioning',
        ],
        correctOptionIndex: 0,
        explanation: 'The course focuses on modular application components and state patterns.',
      },
      {
        questionText: 'Which methodology ensures resilient application deployment?',
        options: [
          'Manual copying of executable files to production servers',
          'Automated CI/CD pipelines with comprehensive unit and integration testing',
          'Disabling all runtime logging in production',
          'Hardcoding API secrets in public client bundles',
        ],
        correctOptionIndex: 1,
        explanation: 'Continuous integration and automated testing ensure consistent, reliable releases.',
      },
    ],
  });

  // Dedicated Quiz Form for adding to existing course
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    timeLimitMinutes: 15,
    passingPercentage: 60,
    questions: [
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        explanation: '',
      },
    ],
  });

  // Lesson Form
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    durationMinutes: 15,
    videoUrl: '/api/videos/stream/react-components.mp4',
    isFreePreview: false,
  });

  const fetchData = async () => {
    try {
      const [cRes, qRes] = await Promise.all([
        api.get('/courses'),
        api.get('/quizzes'),
      ]);
      if (cRes.data.success) setCourses(cRes.data.courses);
      if (qRes.data.success) setQuizzes(qRes.data.quizzes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save Course (with optional initial quiz creation)
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      if (selectedCourse?._id) {
        // Edit course
        await api.put(`/courses/${selectedCourse._id}`, {
          title: courseForm.title,
          subtitle: courseForm.subtitle,
          description: courseForm.description,
          category: courseForm.category,
          level: courseForm.level,
          price: courseForm.price,
          thumbnail: courseForm.thumbnail,
        });
        triggerToastAlert('Course updated successfully', 'info');
      } else {
        // Create course
        const res = await api.post('/courses', {
          title: courseForm.title,
          subtitle: courseForm.subtitle,
          description: courseForm.description,
          category: courseForm.category,
          level: courseForm.level,
          price: courseForm.price,
          thumbnail: courseForm.thumbnail,
        });

        const newCourseId = res.data.course._id;

        // Automatically create the initial quiz for students if enabled
        if (courseForm.createInitialQuiz && courseForm.quizQuestions?.length > 0) {
          await api.post('/quizzes', {
            title: courseForm.quizTitle || `${courseForm.title} Quiz`,
            courseId: newCourseId,
            description: `Official course assessment quiz for ${courseForm.title}.`,
            timeLimitMinutes: courseForm.quizTimeLimit || 15,
            passingPercentage: courseForm.quizPassingPercentage || 60,
            questions: courseForm.quizQuestions,
          });
          triggerToastAlert('Course and student quizzes published successfully!', 'info');
        } else {
          triggerToastAlert('Course created successfully!', 'info');
        }
      }

      setShowCourseModal(false);
      setSelectedCourse(null);
      fetchData();
    } catch (err) {
      triggerToastAlert('Failed to save course or attached quiz', 'warning');
    }
  };

  // Add Question to initial quiz builder
  const handleAddInitialQuizQuestion = () => {
    setCourseForm({
      ...courseForm,
      quizQuestions: [
        ...courseForm.quizQuestions,
        {
          questionText: '',
          options: ['', '', '', ''],
          correctOptionIndex: 0,
          explanation: '',
        },
      ],
    });
  };

  const handleRemoveInitialQuizQuestion = (qIdx) => {
    setCourseForm({
      ...courseForm,
      quizQuestions: courseForm.quizQuestions.filter((_, i) => i !== qIdx),
    });
  };

  // Save dedicated quiz to selected course
  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    if (!managingQuizzesForCourse) return;

    try {
      await api.post('/quizzes', {
        title: quizForm.title,
        courseId: managingQuizzesForCourse._id,
        description: quizForm.description,
        timeLimitMinutes: quizForm.timeLimitMinutes,
        passingPercentage: quizForm.passingPercentage,
        questions: quizForm.questions,
      });

      triggerToastAlert(`Quiz created for ${managingQuizzesForCourse.title}!`, 'info');
      setShowQuizModal(false);
      fetchData();
    } catch (err) {
      triggerToastAlert('Failed to create quiz', 'warning');
    }
  };

  // Delete Course
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course and its associated lessons?')) return;
    try {
      await api.delete(`/courses/${courseId}`);
      triggerToastAlert('Course removed', 'info');
      fetchData();
    } catch (err) {
      triggerToastAlert('Failed to delete course', 'warning');
    }
  };

  // Delete Quiz
  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await api.delete(`/quizzes/${quizId}`);
      triggerToastAlert('Quiz removed', 'info');
      fetchData();
    } catch (err) {
      triggerToastAlert('Failed to delete quiz', 'warning');
    }
  };

  // Add Lesson
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
      fetchData();
    } catch (err) {
      triggerToastAlert('Failed to add lesson', 'warning');
    }
  };

  // Helper to count quizzes per course
  const getQuizzesForCourse = (courseId) => {
    return quizzes.filter((q) => q.course?._id === courseId || q.course === courseId);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 border border-gray-300 text-gray-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Administrator Course & Quiz Control</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Manage Courses & Student Quizzes
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Create courses, upload curricula, and build student quizzes with auto-grading for each course.
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
              createInitialQuiz: true,
              quizTitle: 'Course Comprehension Quiz',
              quizTimeLimit: 15,
              quizPassingPercentage: 60,
              quizQuestions: [
                {
                  questionText: 'What is the primary concept covered in this curriculum?',
                  options: [
                    'Core foundational architecture and component design',
                    'Operating system kernel compilation',
                    'Low-level hardware register assembly',
                    'Relational database disk partitioning',
                  ],
                  correctOptionIndex: 0,
                  explanation: 'The course focuses on modular application components and state patterns.',
                },
              ],
            });
            setShowCourseModal(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Create Course with Quizzes
        </button>
      </div>

      {/* Courses & Quizzes Table */}
      <div className="space-y-4">
        {courses.map((course) => {
          const courseQuizzes = getQuizzesForCourse(course._id);

          return (
            <div
              key={course._id}
              className="p-6 rounded-3xl glass-card space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.03)]"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-800 border border-gray-200">
                        {course.category}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase">
                        {course.level}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mt-1">{course.title}</h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {course.lessons?.length || 0} Lessons • {course.enrolledCount || 0} Students Enrolled • Rating {course.rating || 4.9}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setManagingQuizzesForCourse(course);
                      setQuizForm({
                        title: `${course.title} Assessment Quiz`,
                        description: `Comprehension check for ${course.title}`,
                        timeLimitMinutes: 15,
                        passingPercentage: 60,
                        questions: [
                          {
                            questionText: '',
                            options: ['', '', '', ''],
                            correctOptionIndex: 0,
                            explanation: '',
                          },
                        ],
                      });
                      setShowQuizModal(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <HelpCircle className="w-4 h-4 text-gray-300" /> Add Quiz
                  </button>

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
                    className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all border border-gray-300 flex items-center gap-1.5"
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
                        createInitialQuiz: false,
                        quizQuestions: [],
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

              {/* Sub-section: Quizzes Attached to this Course */}
              <div className="pt-3 border-t border-gray-100 bg-gray-50/70 -mx-6 -mb-6 px-6 py-3.5 rounded-b-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-gray-800" />
                    Quizzes for Students in this Course ({courseQuizzes.length})
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">
                    Available in Student Quiz Portal
                  </span>
                </div>

                {courseQuizzes.length === 0 ? (
                  <p className="text-xs text-gray-500 italic py-1">
                    No quizzes created yet for this course. Click "+ Add Quiz" above to create one.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {courseQuizzes.map((quiz) => (
                      <div
                        key={quiz._id}
                        className="p-3 rounded-xl bg-white border border-gray-200 flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div>
                          <p className="text-xs font-bold text-gray-900">{quiz.title}</p>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {quiz.questions?.length || 0} Questions • Pass {quiz.passingPercentage}% • {quiz.timeLimitMinutes}m
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteQuiz(quiz._id)}
                          className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                          title="Delete Quiz"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE COURSE & QUIZZES MODAL */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl glass-panel border border-white/90 rounded-3xl p-8 shadow-[0_30px_70px_rgba(0,0,0,0.25)] space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200/60">
              <div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">
                  {selectedCourse ? 'Edit Course Details' : 'Create Course with Student Quizzes'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Admin course creator and automated quiz generator
                </p>
              </div>
              <button
                onClick={() => setShowCourseModal(false)}
                className="p-1.5 rounded-xl bg-white/60 hover:bg-white text-gray-600 hover:text-black border border-white/80 transition-all shadow-xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-6">
              {/* Part 1: Course Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  1. Course Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                      Course Title
                    </label>
                    <input
                      type="text"
                      required
                      value={courseForm.title}
                      onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-black"
                      placeholder="e.g. Distributed Cloud Systems & Microservices"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                      Category
                    </label>
                    <select
                      value={courseForm.category}
                      onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                    >
                      <option>Computer Science</option>
                      <option>Artificial Intelligence</option>
                      <option>DevOps & Cloud</option>
                      <option>Cybersecurity</option>
                      <option>Data Engineering</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={courseForm.level}
                      onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>All Levels</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                      Description
                    </label>
                    <textarea
                      rows="2"
                      required
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                      placeholder="Course learning outcomes and syllabus..."
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                      Thumbnail Image URL
                    </label>
                    <input
                      type="text"
                      value={courseForm.thumbnail}
                      onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Part 2: Integrated Quiz Creation for Course */}
              {!selectedCourse && (
                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-black" />
                        2. Create Student Quiz For This Course
                      </h4>
                      <p className="text-xs text-gray-500">
                        Admin generates the quiz questions and passing criteria for students.
                      </p>
                    </div>

                    <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={courseForm.createInitialQuiz}
                        onChange={(e) =>
                          setCourseForm({ ...courseForm, createInitialQuiz: e.target.checked })
                        }
                        className="rounded border-gray-300 text-black focus:ring-black"
                      />
                      Attach Quiz Now
                    </label>
                  </div>

                  {courseForm.createInitialQuiz && (
                    <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                            Quiz Title
                          </label>
                          <input
                            type="text"
                            value={courseForm.quizTitle}
                            onChange={(e) =>
                              setCourseForm({ ...courseForm, quizTitle: e.target.value })
                            }
                            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-900"
                            placeholder="e.g. Chapter Assessment Quiz"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                            Time (Mins) / Pass %
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={courseForm.quizTimeLimit}
                              onChange={(e) =>
                                setCourseForm({
                                  ...courseForm,
                                  quizTimeLimit: parseInt(e.target.value),
                                })
                              }
                              className="w-1/2 bg-white border border-gray-300 rounded-xl px-2 py-1.5 text-xs text-gray-900"
                              title="Time Limit in minutes"
                            />
                            <input
                              type="number"
                              value={courseForm.quizPassingPercentage}
                              onChange={(e) =>
                                setCourseForm({
                                  ...courseForm,
                                  quizPassingPercentage: parseInt(e.target.value),
                                })
                              }
                              className="w-1/2 bg-white border border-gray-300 rounded-xl px-2 py-1.5 text-xs text-gray-900"
                              title="Passing Percentage"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Quiz Questions List */}
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-800">
                            Questions ({courseForm.quizQuestions.length})
                          </span>
                          <button
                            type="button"
                            onClick={handleAddInitialQuizQuestion}
                            className="text-xs font-bold text-black hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Question
                          </button>
                        </div>

                        {courseForm.quizQuestions.map((q, qIdx) => (
                          <div
                            key={qIdx}
                            className="p-4 rounded-xl bg-white border border-gray-200 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-gray-700">
                                Question #{qIdx + 1}
                              </span>
                              {courseForm.quizQuestions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveInitialQuizQuestion(qIdx)}
                                  className="text-gray-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <input
                              type="text"
                              value={q.questionText}
                              onChange={(e) => {
                                const copy = [...courseForm.quizQuestions];
                                copy[qIdx].questionText = e.target.value;
                                setCourseForm({ ...courseForm, quizQuestions: copy });
                              }}
                              placeholder="Enter quiz question prompt..."
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-900"
                            />

                            {/* 4 Choices */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                Options (Select radio for correct answer):
                              </span>
                              {q.options.map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`initial-q-${qIdx}`}
                                    checked={q.correctOptionIndex === optIdx}
                                    onChange={() => {
                                      const copy = [...courseForm.quizQuestions];
                                      copy[qIdx].correctOptionIndex = optIdx;
                                      setCourseForm({ ...courseForm, quizQuestions: copy });
                                    }}
                                    className="accent-black cursor-pointer"
                                    title="Mark as correct option"
                                  />
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                      const copy = [...courseForm.quizQuestions];
                                      copy[qIdx].options[optIdx] = e.target.value;
                                      setCourseForm({ ...courseForm, quizQuestions: copy });
                                    }}
                                    placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                    className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-1 text-xs text-gray-900"
                                  />
                                </div>
                              ))}
                            </div>

                            <input
                              type="text"
                              value={q.explanation}
                              onChange={(e) => {
                                const copy = [...courseForm.quizQuestions];
                                copy[qIdx].explanation = e.target.value;
                                setCourseForm({ ...courseForm, quizQuestions: copy });
                              }}
                              placeholder="Explanation shown after completion..."
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1 text-xs text-gray-600 text-[11px]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold transition-all shadow-sm"
                >
                  {selectedCourse ? 'Update Course' : 'Publish Course & Quizzes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEDICATED ADD QUIZ TO EXISTING COURSE MODAL */}
      {showQuizModal && managingQuizzesForCourse && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl glass-panel border border-white/90 rounded-3xl p-8 shadow-[0_30px_70px_rgba(0,0,0,0.25)] space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Create Student Quiz for {managingQuizzesForCourse.title}
                </h3>
                <p className="text-xs text-gray-500">
                  Admin quiz builder with automatic grading
                </p>
              </div>
              <button
                onClick={() => setShowQuizModal(false)}
                className="text-gray-400 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Quiz Title
                </label>
                <input
                  type="text"
                  required
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                  placeholder="e.g. Hooks & State Management Mastery"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                    Time Limit (Minutes)
                  </label>
                  <input
                    type="number"
                    value={quizForm.timeLimitMinutes}
                    onChange={(e) =>
                      setQuizForm({ ...quizForm, timeLimitMinutes: parseInt(e.target.value) })
                    }
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    value={quizForm.passingPercentage}
                    onChange={(e) =>
                      setQuizForm({ ...quizForm, passingPercentage: parseInt(e.target.value) })
                    }
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                  />
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Quiz Questions ({quizForm.questions.length})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuizForm({
                        ...quizForm,
                        questions: [
                          ...quizForm.questions,
                          { questionText: '', options: ['', '', '', ''], correctOptionIndex: 0, explanation: '' },
                        ],
                      })
                    }
                    className="text-xs font-bold text-black hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </button>
                </div>

                {quizForm.questions.map((q, qIdx) => (
                  <div key={qIdx} className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800">
                        Question #{qIdx + 1}
                      </span>
                      {quizForm.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setQuizForm({
                              ...quizForm,
                              questions: quizForm.questions.filter((_, i) => i !== qIdx),
                            })
                          }
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      required
                      value={q.questionText}
                      onChange={(e) => {
                        const copy = [...quizForm.questions];
                        copy[qIdx].questionText = e.target.value;
                        setQuizForm({ ...quizForm, questions: copy });
                      }}
                      placeholder="Question prompt..."
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-900"
                    />

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Select correct answer option:
                      </span>
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`quiz-q-${qIdx}`}
                            checked={q.correctOptionIndex === optIdx}
                            onChange={() => {
                              const copy = [...quizForm.questions];
                              copy[qIdx].correctOptionIndex = optIdx;
                              setQuizForm({ ...quizForm, questions: copy });
                            }}
                            className="accent-black cursor-pointer"
                          />
                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => {
                              const copy = [...quizForm.questions];
                              copy[qIdx].options[optIdx] = e.target.value;
                              setQuizForm({ ...quizForm, questions: copy });
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                            className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-1 text-xs text-gray-900"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowQuizModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold"
                >
                  Publish Quiz for Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD LESSON MODAL */}
      {showLessonModal && selectedCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-gray-300 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <h3 className="text-base font-bold text-gray-900">Add Lesson to Course</h3>
                <p className="text-xs text-gray-500">{selectedCourse.title}</p>
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
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Lesson Title
                </label>
                <input
                  type="text"
                  required
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                  placeholder="e.g. Asynchronous Microtask Scheduling"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                    Duration (Mins)
                  </label>
                  <input
                    type="number"
                    value={lessonForm.durationMinutes}
                    onChange={(e) => setLessonForm({ ...lessonForm, durationMinutes: parseInt(e.target.value) })}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                    Video Stream URL
                  </label>
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
                  id="previewCheckAdmin"
                  checked={lessonForm.isFreePreview}
                  onChange={(e) => setLessonForm({ ...lessonForm, isFreePreview: e.target.checked })}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <label htmlFor="previewCheckAdmin" className="text-xs text-gray-700">
                  Enable Free Preview for this lesson
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
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold"
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
