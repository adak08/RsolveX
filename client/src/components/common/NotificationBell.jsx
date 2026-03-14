import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { timeAgo } from '../../utils/helpers';
import socketService from '../../services/socketService';

const typeStyles = {
  success: { bg: 'bg-green-100 dark:bg-green-900/30', icon: '✓', color: 'text-green-600 dark:text-green-400' },
  warning: { bg: 'bg-amber-100 dark:bg-amber-900/30', icon: '!', color: 'text-amber-600 dark:text-amber-400' },
  error: { bg: 'bg-red-100 dark:bg-red-900/30', icon: '✗', color: 'text-red-600 dark:text-red-400' },
  info: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'i', color: 'text-blue-600 dark:text-blue-400' },
  update: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: '↑', color: 'text-orange-600 dark:text-orange-400' },
  new_complaint: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: '!', color: 'text-purple-600 dark:text-purple-400' },
  new_message: { bg: 'bg-teal-100 dark:bg-teal-900/30', icon: '✉', color: 'text-teal-600 dark:text-teal-400' },
};

export default function NotificationBell() {
  const { authStatus } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef();

  const userId = authStatus.userData?._id;

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/api/notifications/${userId}?limit=20`);
      // Backend: { success, data: { notifications: [...], unreadCount: N } }
      const d = res.data?.data || {};
      const list = d.notifications || [];
      setNotifications(list);
      setUnread(typeof d.unreadCount === 'number' ? d.unreadCount : list.filter(n => !n.isRead).length);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);

    const socket = socketService.getSocket();
    if (socket) {
      socket.on('notification', (n) => {
        setNotifications(prev => [n, ...prev]);
        setUnread(u => u + 1);
      });
    }

    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(p => p.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnread(u => Math.max(0, u - 1));
    } catch {}
  };

  const markAllRead = async () => {
    if (!userId) return;
    try {
      await api.patch(`/api/notifications/${userId}/read-all`);
      setNotifications(p => p.map(n => ({ ...n, isRead: true })));
      setUnread(0);
    } catch {}
  };

  const deleteNotif = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications(p => p.filter(n => n._id !== id));
    } catch {}
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute right-0 top-12 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="font-display font-600 text-sm" style={{ color: 'var(--text-primary)' }}>
                Notifications {unread > 0 && <span className="ml-1 text-orange-500">({unread})</span>}
              </span>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button onClick={markAllRead} className="btn-ghost text-xs py-1 px-2">
                    <CheckCheck size={14} /> All read
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto max-h-80">
              {notifications.length === 0 ? (
                <div className="py-10 text-center" style={{ color: 'var(--text-muted)' }}>
                  <Bell size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => {
                  const s = typeStyles[n.type] || typeStyles.info;
                  return (
                    <div
                      key={n._id}
                      onClick={() => !n.isRead && markRead(n._id)}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-[var(--bg-secondary)] ${!n.isRead ? 'bg-orange-50 dark:bg-orange-950/20' : ''}`}
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${s.bg} ${s.color}`}>
                        {s.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>{n.message}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{timeAgo(n.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-orange-500" />}
                        <button onClick={(e) => deleteNotif(n._id, e)} className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center hover:bg-[var(--bg-tertiary)] transition-all">
                          <X size={12} style={{ color: 'var(--text-muted)' }} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
