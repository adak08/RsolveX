import React from 'react';
import { statusColor, priorityColor } from '../../utils/helpers';

export function StatusBadge({ status }) {
  const labels = { pending: 'Pending', 'in-progress': 'In Progress', resolved: 'Resolved', rejected: 'Rejected' };
  return <span className={`badge ${statusColor(status)}`}>{labels[status] || status}</span>;
}

export function PriorityBadge({ priority }) {
  const labels = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };
  const dots = { low: '●', medium: '●', high: '●', critical: '●' };
  return (
    <span className={`badge ${priorityColor(priority)}`}>
      <span className="text-[8px]">{dots[priority] || '●'}</span>
      {labels[priority] || priority}
    </span>
  );
}

export function CategoryBadge({ category }) {
  const map = { road: '🛣️ Road', water: '💧 Water', electricity: '⚡ Electric', sanitation: '🗑️ Sanitation', other: '📋 Other' };
  return (
    <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
      {map[category] || category}
    </span>
  );
}

export function AiBadge({ reasoning }) {
  return (
    <span className="badge" style={{ background: 'rgba(139,92,246,0.1)', color: '#7c3aed' }} title={reasoning}>
      ✦ AI
    </span>
  );
}
