import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Common Components
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import LiquidBackground from './components/common/LiquidBackground';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import CourseCatalog from './pages/student/CourseCatalog';
import MyCourses from './pages/student/MyCourses';
import CourseViewer from './pages/student/CourseViewer';
import LiveClassesPage from './pages/student/LiveClassesPage';
import AssignmentsPage from './pages/student/AssignmentsPage';
import QuizzesPage from './pages/student/QuizzesPage';
import ExamsPage from './pages/student/ExamsPage';
import ExamPortal from './pages/student/ExamPortal';
import ExamResultPage from './pages/student/ExamResultPage';
import ResultsHistoryPage from './pages/student/ResultsHistoryPage';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherCourses from './pages/teacher/TeacherCourses';
import VideoUploaderPage from './pages/teacher/VideoUploaderPage';
import TeacherLiveClassesPage from './pages/teacher/TeacherLiveClassesPage';
import ExamBuilderPage from './pages/teacher/ExamBuilderPage';
import TeacherProctoringPage from './pages/teacher/TeacherProctoringPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import AdminCoursesPage from './pages/admin/AdminCoursesPage';
import AdminProctoringAuditPage from './pages/admin/AdminProctoringAuditPage';
import SystemSettingsPage from './pages/admin/SystemSettingsPage';

// Shared Pages
import ProfilePage from './pages/shared/ProfilePage';

// Protected Layout with Sidebar and Top Navbar
function DashboardLayout() {
  const { user, loading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white/70 font-medium">
        <div className="flex items-center gap-3 glass-panel px-6 py-4 rounded-2xl">
          <div className="w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
          <span>Loading Skillora glass interface...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="relative min-h-screen font-sans selection:bg-black selection:text-white">
      {/* Dynamic Liquid Mesh Ambient Background */}
      <LiquidBackground />

      {/* Main Glass Shell */}
      <div className="relative z-10 flex min-h-screen text-gray-900">
        <Sidebar
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar
            onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          />
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

// Smart Root Redirect based on user role
function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Focused Full-Screen Exam Session (omits standard navbar/sidebar for integrity) */}
            <Route path="/exam-portal/:id" element={<ExamPortal />} />

            {/* Protected App Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<RootRedirect />} />

              {/* Student Routes */}
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/courses" element={<CourseCatalog />} />
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/course-view/:id" element={<CourseViewer />} />
              <Route path="/live-classes" element={<LiveClassesPage />} />
              <Route path="/assignments" element={<AssignmentsPage />} />
              <Route path="/quizzes" element={<QuizzesPage />} />
              <Route path="/exams" element={<ExamsPage />} />
              <Route path="/exam-result/:id" element={<ExamResultPage />} />
              <Route path="/results" element={<ResultsHistoryPage />} />

              {/* Teacher Routes */}
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/courses" element={<TeacherCourses />} />
              <Route path="/teacher/upload-video" element={<VideoUploaderPage />} />
              <Route path="/teacher/live-classes" element={<TeacherLiveClassesPage />} />
              <Route path="/teacher/assignments" element={<AssignmentsPage />} />
              <Route path="/teacher/quizzes" element={<QuizzesPage />} />
              <Route path="/teacher/exams" element={<ExamBuilderPage />} />
              <Route path="/teacher/proctoring" element={<TeacherProctoringPage />} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/courses" element={<AdminCoursesPage />} />
              <Route path="/admin/proctoring" element={<AdminProctoringAuditPage />} />
              <Route path="/admin/settings" element={<SystemSettingsPage />} />

              {/* Shared Routes */}
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}
