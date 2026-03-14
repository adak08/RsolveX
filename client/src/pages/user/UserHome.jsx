import React, { useState } from 'react';
import { Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { Home, AlertCircle, List, PlusCircle, Award, User, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/common/ThemeToggle';
import NotificationBell from '../../components/common/NotificationBell';
import UserDashboard from './UserDashboard';
import AllComplaints from './AllComplaints';
import MyComplaints from './MyComplaints';
import RaiseComplaint from './RaiseComplaint';
import Leaderboard from './Leaderboard';
import UserProfile from './UserProfile';
import { getInitials, avatarBg } from '../../utils/helpers';

const NAV = [
  { to: '/home', icon: Home, label: 'Dashboard', end: true },
  { to: '/home/complaints', icon: AlertCircle, label: 'All Complaints' },
  { to: '/home/my-complaints', icon: List, label: 'My Complaints' },
  { to: '/home/raise', icon: PlusCircle, label: 'Raise Issue' },
  { to: '/home/leaderboard', icon: Award, label: 'Leaderboard' },
  { to: '/home/profile', icon: User, label: 'Profile' },
];

export default function UserHome() {
  const { authStatus, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      <aside className="hidden lg:flex flex-col w-56 shrink-0" style={{ background: 'var(--bg-primary)', borderRight: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5 px-4 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-display font-700 text-sm">R</span>
          </div>
          <span className="font-display font-700 text-base" style={{ color: 'var(--text-primary)' }}>ResolveX</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon size={17} className="shrink-0" /><span className="text-sm">{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl mb-2" style={{ background: 'var(--bg-tertiary)' }}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${avatarBg(authStatus.userName)}`}>{getInitials(authStatus.userName)}</div>
            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{authStatus.userName}</p>
          </div>
          <button onClick={logout} className="sidebar-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
            <LogOut size={17} /><span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
      <AnimatePresence>
        {mobileOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 w-56 z-50 flex flex-col lg:hidden" style={{ background: 'var(--bg-primary)', borderRight: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="font-display font-700" style={{ color: 'var(--text-primary)' }}>ResolveX</span>
              <button onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {NAV.map(({ to, icon: Icon, label, end }) => (
                <NavLink key={to} to={to} end={end} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                  <Icon size={17} /><span className="text-sm">{label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="px-3 py-4" style={{ borderTop: '1px solid var(--border)' }}>
              <button onClick={logout} className="sidebar-link w-full text-red-500"><LogOut size={17} /><span className="text-sm">Logout</span></button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-4 lg:px-6 py-3 shrink-0" style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)', minHeight: 60 }}>
          <button onClick={() => setMobileOpen(true)} className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}><Menu size={18} /></button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2"><NotificationBell /><ThemeToggle /></div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Routes>
            <Route index element={<UserDashboard />} />
            <Route path="complaints" element={<AllComplaints />} />
            <Route path="my-complaints" element={<MyComplaints />} />
            <Route path="raise" element={<RaiseComplaint />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
