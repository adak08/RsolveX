import React from 'react';
import { getInitials } from '../../utils/helpers';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../constants';

// ─── Status Badge ─────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const cls = STATUS_COLORS[status] || 'badge-pending';
  const labels = { pending: 'Pending', 'in-progress': 'In Progress', resolved: 'Resolved', rejected: 'Rejected' };
  return <span className={`badge ${cls}`}>{labels[status] || status}</span>;
};

// ─── Priority Badge ───────────────────────────────────────────────────────────
export const PriorityBadge = ({ priority }) => {
  const cls = PRIORITY_COLORS[priority] || 'badge-medium';
  return <span className={`badge ${cls} capitalize`}>{priority}</span>;
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
export const Avatar = ({ name, image, size = 'md', className = '' }) => {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };
  const initials = getInitials(name);
  if (image) {
    return <img src={image} alt={name} className={`${sizes[size]} rounded-full object-cover ${className}`} />;
  }
  return (
    <div className={`${sizes[size]} rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-semibold flex items-center justify-center shrink-0 ${className}`}>
      {initials}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export const Skeleton = ({ className = '' }) => (
  <div className={`shimmer rounded-lg ${className}`} />
);

export const SkeletonCard = () => (
  <div className="card space-y-3">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-5/6" />
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && (
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--accent-light)' }}>
        <Icon className="w-8 h-8" style={{ color: 'var(--accent)' }} />
      </div>
    )}
    <p className="font-display font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>{title}</p>
    {description && <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{description}</p>}
    {action}
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
export const Toast = ({ message, type = 'info', onClose }) => {
  const colors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
  };
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium ${colors[type]}`}>
      <span className="flex-1">{message}</span>
      {onClose && <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">✕</button>}
    </div>
  );
};

// ─── Loading Spinner ──────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-3' };
  return (
    <div className={`${sizes[size]} border-t-transparent rounded-full animate-spin ${className}`}
      style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
  );
};

// ─── Page Loader ──────────────────────────────────────────────────────────────
export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 mb-4">
        <div className="w-3 h-3 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '0ms' }} />
        <div className="w-3 h-3 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '150ms' }} />
        <div className="w-3 h-3 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '300ms' }} />
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Loading ResolveX…</p>
    </div>
  </div>
);

// ─── Confirmation Modal ───────────────────────────────────────────────────────
export const ConfirmModal = ({ title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
    <div className="card w-full max-w-sm animate-slide-up">
      <h3 className="font-display font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="btn-secondary text-sm">Cancel</button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition-all ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'}`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

// ─── Category Icon ────────────────────────────────────────────────────────────
export const CategoryIcon = ({ category }) => {
  const icons = { road: '🛣️', water: '💧', electricity: '⚡', sanitation: '🗑️', other: '📋' };
  return <span className="text-base">{icons[category] || '📋'}</span>;
};

// ─── Input Field ──────────────────────────────────────────────────────────────
export const InputField = ({ label, error, className = '', ...props }) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</label>}
    <input className="input" {...props} />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ─── Select Field ─────────────────────────────────────────────────────────────
export const SelectField = ({ label, error, children, className = '', ...props }) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</label>}
    <select className="input" {...props}>{children}</select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ─── Textarea Field ───────────────────────────────────────────────────────────
export const TextareaField = ({ label, error, className = '', ...props }) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</label>}
    <textarea className="input resize-none" rows={4} {...props} />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);
