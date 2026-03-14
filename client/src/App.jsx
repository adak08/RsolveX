import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';

import AuthModal from './components/auth/AuthModal';
import LandingPage from './pages/public/LandingPage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminIssuesPage from './pages/admin/AdminIssuesPage';
import AdminStaffPage from './pages/admin/AdminStaffPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import StaffLayout from './layouts/StaffLayout';
import UserHome from './pages/user/UserHome';
import Loader from './components/common/Loader';

function ProtectedRoute({ children, role }) {
  const { authStatus, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullScreen text="Loading…" />;
  if (!authStatus.isAuthenticated) return <Navigate to="/" state={{ from: location }} replace />;
  if (role && authStatus.userRole !== role) {
    const redirects = { admin: '/admin/dashboard', staff: '/staff/dashboard', user: '/home' };
    return <Navigate to={redirects[authStatus.userRole] || '/'} replace />;
  }
  return children;
}

function AppRoutes() {
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState('user');
  const { authStatus, loading } = useAuth();

  const openAuthModal = (tab = 'user') => { setAuthTab(tab); setShowAuth(true); };

  if (loading) return <Loader fullScreen text="Starting ResolveX…" />;

  return (
    <>
      <AnimatePresence>
        {showAuth && (
          <AuthModal
            open={showAuth}
            onClose={() => setShowAuth(false)}
            defaultTab={authTab}
            onAuthSuccess={(role) => {
              setShowAuth(false);
              // navigation happens in ProtectedRoute / LandingPage redirect
            }}
          />
        )}
      </AnimatePresence>

      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage openAuthModal={openAuthModal} />} />

        {/* User */}
        <Route path="/home/*" element={
          <ProtectedRoute role="user">
            <UserHome />
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin/*" element={
          <ProtectedRoute role="admin">
            <AdminLayout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="issues" element={<AdminIssuesPage />} />
                <Route path="staff" element={<AdminStaffPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="audit" element={<AuditLogsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        } />

        {/* Staff */}
        <Route path="/staff/*" element={
          <ProtectedRoute role="staff">
            <StaffLayout />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
