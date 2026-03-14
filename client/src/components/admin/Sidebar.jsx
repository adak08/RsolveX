import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Users, UserCog, BarChart3,
  ClipboardList, Settings, LogOut, ChevronLeft, ChevronRight,
  Shield, Bell, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { Avatar } from '../common/UI';

const links = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/issues', icon: FileText, label: 'Issues' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/staff', icon: UserCog, label: 'Staff' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/audit', icon: ClipboardList, label: 'Audit Logs' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const AdminSidebar = () => {
  const { pathname } = useLocation();
  const { authStatus, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.2 }}
      className="hidden md:flex flex-col h-screen sticky top-0 border-r shrink-0 overflow-hidden"
      style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--accent)' }}>
          <Shield className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              ResolveX
            </motion.span>
          )}
        </AnimatePresence>
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ color: 'var(--text-muted)' }}>
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
        {links.map(({ to, icon: Icon, label }) => {
          const active = pathname === to || (to !== '/admin/dashboard' && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`sidebar-link ${active ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t space-y-1" style={{ borderColor: 'var(--border)' }}>
        <button onClick={toggle} className={`sidebar-link w-full ${collapsed ? 'justify-center px-2' : ''}`}>
          {dark ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
          <AnimatePresence>
            {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">{dark ? 'Light mode' : 'Dark mode'}</motion.span>}
          </AnimatePresence>
        </button>
        <button onClick={logout} className={`sidebar-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 ${collapsed ? 'justify-center px-2' : ''}`}>
          <LogOut className="w-4 h-4 shrink-0" />
          <AnimatePresence>
            {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">Sign out</motion.span>}
          </AnimatePresence>
        </button>

        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2 mt-1 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
            <Avatar name={authStatus.userName} size="sm" />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{authStatus.userName}</p>
              <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>Admin</p>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;
