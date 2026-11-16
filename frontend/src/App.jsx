import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import SetupAdmin from './pages/auth/SetupAdmin';
import LandingPage from './pages/LandingPage';

// Student Pages 
import StudentDashboard from './pages/student/Dashboard';
import Profile from './pages/student/Profile';
import JobsApplications from './pages/student/JobsApplications';
import InterviewsNotifications from './pages/student/InterviewsNotifications';
import AICareerAssistant from './pages/student/AICareerAssistant';

// Admin Pages 
import AdminDashboard from './pages/admin/Dashboard';
import CompaniesJobs from './pages/admin/CompaniesJobs';
import Candidates from './pages/admin/Candidates';
import AIAgent from './pages/admin/AIAgent';
import InterviewCoordination from './pages/admin/InterviewCoordination';
import Notifications from './pages/admin/Notifications';
import Analytics from './pages/admin/Analytics';

// Helper component for root redirection based on verified auth state
const RootRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return user.role === 'admin' ? (
    <Navigate to="/admin" replace />
  ) : (
    <Navigate to="/student" replace />
  );
};

// Layout Wrappers consuming AuthContext
const AdminPortal = ({ children }) => {
  const { user, logout } = useAuth();
  return (
    <AdminLayout user={user} onLogout={logout}>
      {children}
    </AdminLayout>
  );
};

const StudentPortal = ({ children }) => {
  const { user, logout } = useAuth();
  return (
    <StudentLayout user={user} onLogout={logout}>
      {children}
    </StudentLayout>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="min-h-screen flex flex-col bg-gradient-page-light dark:bg-gradient-page-dark transition-colors duration-300">
            <Routes>
              {/* Public Auth Routes */}
              <Route
                path="/login"
                element={
                  <AuthLayout>
                    <Login />
                  </AuthLayout>
                }
              />
              <Route
                path="/register"
                element={
                  <AuthLayout>
                    <Register />
                  </AuthLayout>
                }
              />
              <Route
                path="/setup-admin"
                element={
                  <AuthLayout>
                    <SetupAdmin />
                  </AuthLayout>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <AuthLayout>
                    <ForgotPassword />
                  </AuthLayout>
                }
              />

              {/* Protected Admin Routes (Role: admin) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPortal>
                      <AdminDashboard />
                    </AdminPortal>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/companies"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPortal>
                      <CompaniesJobs />
                    </AdminPortal>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/candidates"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPortal>
                      <Candidates />
                    </AdminPortal>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/agent"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPortal>
                      <AIAgent />
                    </AdminPortal>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/coordination"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPortal>
                      <InterviewCoordination />
                    </AdminPortal>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notifications"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPortal>
                      <Notifications />
                    </AdminPortal>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPortal>
                      <Analytics />
                    </AdminPortal>
                  </ProtectedRoute>
                }
              />

              {/* Protected Student Routes (Role: student) */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentPortal>
                      <StudentDashboard />
                    </StudentPortal>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentPortal>
                      <Profile />
                    </StudentPortal>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/jobs"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentPortal>
                      <JobsApplications />
                    </StudentPortal>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/interviews"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentPortal>
                      <InterviewsNotifications />
                    </StudentPortal>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/ai-assistant"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentPortal>
                      <AICareerAssistant />
                    </StudentPortal>
                  </ProtectedRoute>
                }
              />

              {/* Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
