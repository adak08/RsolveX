export const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const formatDate = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export const formatDateTime = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

export const statusColor = (status) => ({
  pending: 'badge-pending',
  'in-progress': 'badge-in-progress',
  resolved: 'badge-resolved',
  rejected: 'badge-rejected',
}[status] || 'badge-pending');

export const priorityColor = (priority) => ({
  low: 'badge-low',
  medium: 'badge-medium',
  high: 'badge-high',
  critical: 'badge-critical',
}[priority] || 'badge-medium');

export const categoryIcon = (cat) => ({
  road: '🛣️', water: '💧', electricity: '⚡', sanitation: '🗑️', other: '📋',
}[cat] || '📋');

export const getInitials = (name) =>
  name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';

export const avatarBg = (name) => {
  const colors = ['bg-orange-500','bg-amber-500','bg-rose-500','bg-blue-500','bg-teal-500','bg-violet-500','bg-emerald-500'];
  const i = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[i];
};

export const truncate = (str, n = 80) =>
  str && str.length > n ? str.slice(0, n) + '…' : str;

export const errMsg = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong';

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ') : '';

export const formatTimeAgo = (dateStr) => timeAgo(dateStr);
