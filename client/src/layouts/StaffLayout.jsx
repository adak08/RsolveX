import React, { useState } from 'react';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, MessageSquare, User, LogOut, Briefcase, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/common/ThemeToggle';
import NotificationBell from '../components/common/NotificationBell';
import { getInitials, avatarBg } from '../utils/helpers';
import StaffDashboard from '../pages/staff/StaffDashboard';
import StaffIssuesPage from '../pages/staff/StaffIssuesPage';
import StaffChatPage from '../pages/staff/StaffChatPage';
import StaffProfilePage from '../pages/staff/StaffProfilePage';

const NAV = [
  { to: '/staff/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/staff/issues', icon: AlertCircle, label: 'My Issues' },
  { to: '/staff/chat', icon: MessageSquare, label: 'Messages' },
  { to: '/staff/profile', icon: User, label: 'Profile' },
];

export default function StaffLayout() {
  const { authStatus, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = ({ onLinkClick }) => (
    <>
      <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid var(--border)', minHeight: 64 }}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shrink-0 shadow-lg">
          <Briefcase size={16} className="text-white" />
        </div>
        {(!collapsed || mobileOpen) && (
          <div>
            <span className="font-display font-700 text-base" style={{ color: 'var(--text-primary)' }}>ResolveX</span>
            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 font-medium">Staff</span>
          </div>
        )}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} ${collapsed && !mobileOpen ? 'justify-center px-2' : ''}`}
            title={collapsed && !mobileOpen ? label : ''}
            onClick={onLinkClick}
          >
            <Icon size={18} className="shrink-0" />
            {(!collapsed || mobileOpen) && <span className="text-sm">{label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
        {(!collapsed || mobileOpen) && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarBg(authStatus.userName)}`}>
              {getInitials(authStatus.userName)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{authStatus.userName}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Staff Member</p>
            </div>
          </div>
        )}
        <button onClick={logout} className={`sidebar-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 ${collapsed && !mobileOpen ? 'justify-center px-2' : ''}`}>
          <LogOut size={18} />{(!collapsed || mobileOpen) && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 220 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col shrink-0 relative"
        style={{ background: 'var(--bg-primary)', borderRight: '1px solid var(--border)' }}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3.5 top-16 w-7 h-7 rounded-full shadow-md flex items-center justify-center"
          style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: -220 }} animate={{ x: 0 }} exit={{ x: -220 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-56 z-50 flex flex-col lg:hidden"
              style={{ background: 'var(--bg-primary)', borderRight: '1px solid var(--border)' }}
            >
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
              <SidebarContent onLinkClick={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-4 lg:px-6 py-3 shrink-0" style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)', minHeight: 64 }}>
          <button onClick={() => setMobileOpen(true)} className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}><Menu size={18} /></button>
          <h1 className="hidden lg:block font-display font-600 text-lg" style={{ color: 'var(--text-primary)' }}>Staff Panel</h1>
          <div className="flex items-center gap-2"><NotificationBell /><ThemeToggle /></div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Routes>
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="issues" element={<StaffIssuesPage />} />
            <Route path="chat" element={<StaffChatPage />} />
            <Route path="profile" element={<StaffProfilePage />} />
            <Route path="*" element={<Navigate to="/staff/dashboard" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
