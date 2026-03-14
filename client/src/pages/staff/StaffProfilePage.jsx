import React, { useState } from 'react';
import { User, Save, Star, TrendingUp, CheckCircle, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInitials, avatarBg } from '../../utils/helpers';

export default function StaffProfilePage() {
  const { authStatus } = useAuth();
  const d = authStatus.userData || {};

  return (
    <div className="max-w-lg space-y-6 animate-fade-in">
      <h1 className="font-display font-700 text-2xl" style={{ color: 'var(--text-primary)' }}>Profile</h1>

      <div className="card flex items-center gap-5">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold ${avatarBg(authStatus.userName)}`}>
          {getInitials(authStatus.userName)}
        </div>
        <div>
          <p className="font-display font-600 text-lg" style={{ color: 'var(--text-primary)' }}>{authStatus.userName}</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{d.email}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="badge badge-in-progress">Staff Member</span>
            {d.staffId && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-md" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{d.staffId}</span>
            )}
          </div>
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="font-display font-600 text-base" style={{ color: 'var(--text-primary)' }}>Account Details</h2>
        {[
          { label: 'Full Name', value: d.name },
          { label: 'Email', value: d.email },
          { label: 'Phone', value: d.phone || '—' },
          { label: 'Staff ID', value: d.staffId },
          { label: 'Status', value: d.isActive ? 'Active' : 'Inactive' },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{row.label}</span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-2xl text-sm" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--text-muted)' }}>To update your profile details, please contact your workspace administrator.</p>
      </div>
    </div>
  );
}
