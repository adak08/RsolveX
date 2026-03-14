import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Briefcase, Shield, ArrowRight, Building2 } from 'lucide-react';
import UserAuthForm from './UserAuthForm';
import StaffAuthForm from './StaffAuthForm';
import AdminAuthForm from './AdminAuthForm';
import WorkspaceRegisterForm from './WorkspaceRegisterForm';

const TABS = [
  { id: 'user', label: 'Citizen', icon: User },
  { id: 'staff', label: 'Staff', icon: Briefcase },
  { id: 'admin', label: 'Admin', icon: Shield },
];

export default function AuthModal({ open, onClose, onAuthSuccess, defaultTab = 'user' }) {
  const [tab, setTab] = useState(defaultTab);
  const [showWorkspaceReg, setShowWorkspaceReg] = useState(false);

  useEffect(() => { if (open) setTab(defaultTab); }, [open, defaultTab]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);

  const handleSuccess = (role) => {
    onAuthSuccess?.(role);
    onClose?.();
  };

  if (!open) return null;

  if (showWorkspaceReg) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
          style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="font-display font-700 text-lg" style={{ color: 'var(--text-primary)' }}>Create Workspace</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-tertiary)] transition-colors" style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
          </div>
          <div className="p-6">
            <WorkspaceRegisterForm onSuccess={handleSuccess} onBack={() => setShowWorkspaceReg(false)} />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="font-display font-700 text-xl" style={{ color: 'var(--text-primary)' }}>Welcome to ResolveX</h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Sign in or create your account</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-tertiary)] transition-colors" style={{ color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex p-1 rounded-xl gap-1" style={{ background: 'var(--bg-tertiary)' }}>
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${tab === t.id ? 'bg-white dark:bg-[var(--bg-secondary)] shadow-sm text-orange-600' : ''}`}
                  style={{ color: tab === t.id ? 'var(--accent)' : 'var(--text-muted)' }}
                >
                  <Icon size={14} />{t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <div className="px-6 pb-6 max-h-[70vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
              {tab === 'user' && <UserAuthForm onSuccess={handleSuccess} />}
              {tab === 'staff' && <StaffAuthForm onSuccess={handleSuccess} />}
              {tab === 'admin' && <AdminAuthForm onSuccess={handleSuccess} onCreateWorkspace={() => setShowWorkspaceReg(true)} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
