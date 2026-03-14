import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, AlertCircle, Users, UserCheck, BarChart3,
  ClipboardList, Settings, LogOut, ChevronLeft, ChevronRight,
  Building2, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/common/ThemeToggle';
import NotificationBell from '../components/common/NotificationBell';
import { getInitials, avatarBg } from '../utils/helpers';

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/issues', icon: AlertCircle, label: 'Complaints' },
  { to: '/admin/staff', icon: UserCheck, label: 'Staff' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/audit', icon: ClipboardList, label: 'Audit Logs' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }) {
  const { authStatus, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex flex-col shrink-0 relative z-10"
        style={{ background: 'var(--bg-primary)', borderRight: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid var(--border)', minHeight: 64 }}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shrink-0 shadow-lg">
            <Shield size={16} className="text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span className="font-display font-700 text-base" style={{ color: 'var(--text-primary)' }}>ResolveX</span>
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-600 font-medium">Admin</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? label : ''}
            >
              <Icon size={18} className="shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarBg(authStatus.userName)}`}>
                {getInitials(authStatus.userName)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{authStatus.userName}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Administrator</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={`sidebar-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 ${collapsed ? 'justify-center px-2' : ''}`}
            title={collapsed ? 'Logout' : ''}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3.5 top-16 w-7 h-7 rounded-full shadow-md flex items-center justify-center z-20 transition-colors"
          style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 shrink-0" style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)', minHeight: 64 }}>
          <div>
            <h1 className="font-display font-600 text-lg" style={{ color: 'var(--text-primary)' }}>Admin Panel</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
