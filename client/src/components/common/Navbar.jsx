import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Moon, Sun, Bell, Menu, X, ChevronDown, LogOut, User, Settings, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from './UI';
import { formatTimeAgo } from '../../utils/helpers';
import { notificationService } from '../../services';

const Navbar = ({ isLanding = false, scrollToSection }) => {
  const { dark, toggle } = useTheme();
  const { authStatus, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    if (authStatus.isAuthenticated && authStatus.userData?._id) {
      fetchNotifications();
    }
  }, [authStatus]);

  const fetchNotifications = async () => {
    try {
      const userId = authStatus.userData?._id;
      if (!userId) return;
      const res = await notificationService.getAll(userId);
      if (res.data?.data) {
        setNotifications(res.data.data.slice(0, 10));
        setUnreadCount(res.data.data.filter(n => !n.isRead).length);
      }
    } catch { /* silent */ }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  const getDashboardPath = () => {
    if (authStatus.userRole === 'admin') return '/admin/dashboard';
    if (authStatus.userRole === 'staff') return '/staff/dashboard';
    return '/home';
  };

  const bgClass = scrolled || !isLanding
    ? 'glass shadow-sm'
    : 'bg-transparent';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <span className="text-white font-display font-bold text-sm">R</span>
            </div>
            <span className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              Resolve<span style={{ color: 'var(--accent)' }}>X</span>
            </span>
          </Link>

          {/* Desktop Nav Links (landing only) */}
          {isLanding && (
            <div className="hidden md:flex items-center gap-6">
              {['features', 'how-it-works', 'testimonials'].map(id => (
                <button
                  key={id}
                  onClick={() => scrollToSection?.(id)}
                  className="text-sm font-medium capitalize transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {id.replace(/-/g, ' ')}
                </button>
              ))}
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {authStatus.isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center relative transition-all"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 mt-2 w-80 card shadow-xl z-50 overflow-hidden p-0"
                      >
                        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</span>
                          {unreadCount > 0 && (
                            <button
                              onClick={() => {
                                notificationService.markAllRead(authStatus.userData?._id);
                                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                                setUnreadCount(0);
                              }}
                              className="text-xs" style={{ color: 'var(--accent)' }}
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="py-8 text-center">
                              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: 'var(--text-muted)' }} />
                              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No notifications</p>
                            </div>
                          ) : notifications.map(n => (
                            <button
                              key={n._id}
                              onClick={() => handleMarkRead(n._id)}
                              className="w-full text-left px-4 py-3 hover:opacity-90 transition-all border-b last:border-0 flex gap-3 items-start"
                              style={{
                                background: n.isRead ? 'transparent' : 'var(--accent-light)',
                                borderColor: 'var(--border)',
                              }}
                            >
                              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: n.isRead ? 'var(--border)' : 'var(--accent)' }} />
                              <div>
                                <p className="text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>{n.message}</p>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{formatTimeAgo(n.createdAt)}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-all"
                    style={{ background: 'var(--bg-tertiary)' }}
                  >
                    <Avatar name={authStatus.userName} size="sm" />
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>{authStatus.userName}</p>
                      <p className="text-xs capitalize mt-0.5" style={{ color: 'var(--text-muted)' }}>{authStatus.userRole}</p>
                    </div>
                    <ChevronDown className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 mt-2 w-52 card shadow-xl z-50 p-1.5 space-y-0.5"
                      >
                        <button
                          onClick={() => { navigate(getDashboardPath()); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all"
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </button>
                        {authStatus.userRole === 'user' && (
                          <button
                            onClick={() => { navigate('/home/profile'); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all"
                            style={{ color: 'var(--text-secondary)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <User className="w-4 h-4" /> Profile
                          </button>
                        )}
                        {authStatus.userRole === 'admin' && (
                          <button
                            onClick={() => { navigate('/admin/settings'); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all"
                            style={{ color: 'var(--text-secondary)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <Settings className="w-4 h-4" /> Settings
                          </button>
                        )}
                        <div className="border-t my-1" style={{ borderColor: 'var(--border)' }} />
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 transition-all"
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <LogOut className="w-4 h-4" /> Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/?auth=login')}
                  className="btn-ghost text-sm hidden sm:flex"
                >
                  Sign in
                </button>
                <button
                  onClick={() => navigate('/?auth=signup')}
                  className="btn-primary text-sm"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile menu btn */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t px-4 py-4 space-y-2"
            style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}
          >
            {isLanding && ['features', 'how-it-works', 'testimonials'].map(id => (
              <button
                key={id}
                onClick={() => { scrollToSection?.(id); setMobileOpen(false); }}
                className="w-full text-left py-2 text-sm font-medium capitalize"
                style={{ color: 'var(--text-secondary)' }}
              >
                {id.replace(/-/g, ' ')}
              </button>
            ))}
            {!authStatus.isAuthenticated && (
              <>
                <button onClick={() => navigate('/?auth=login')} className="w-full btn-secondary text-sm">Sign in</button>
                <button onClick={() => navigate('/?auth=signup')} className="w-full btn-primary text-sm">Get Started</button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
