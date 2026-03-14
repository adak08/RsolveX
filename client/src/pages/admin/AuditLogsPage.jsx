import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Filter } from 'lucide-react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import { formatDateTime } from '../../utils/helpers';

const ACTION_COLORS = {
  'complaint.created': 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
  'complaint.assigned': 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
  'complaint.status_changed': 'bg-violet-100 dark:bg-violet-900/30 text-violet-600',
  'complaint.rejected': 'bg-red-100 dark:bg-red-900/30 text-red-600',
  'complaint.resolved': 'bg-green-100 dark:bg-green-900/30 text-green-600',
  'staff.registered': 'bg-teal-100 dark:bg-teal-900/30 text-teal-600',
  'user.joined_workspace': 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [action, setAction] = useState('');
  const [actor, setActor] = useState('');
  const LIMIT = 25;

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (action) params.action = action;
      if (actor) params.actorModel = actor;
      const res = await api.get('/api/audit', { params });
      setLogs(res.data?.data || []);
      setTotal(res.data?.pagination?.total || 0);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, action, actor]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-700 text-2xl" style={{ color: 'var(--text-primary)' }}>Audit Logs</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{total} total entries</p>
        </div>
        <button onClick={load} className="btn-secondary"><RefreshCw size={14} /></button>
      </div>

      {/* Filters */}
      <div className="card py-3 px-4 flex flex-wrap gap-3 items-center">
        <select className="input py-2 text-sm w-auto" value={action} onChange={e => { setAction(e.target.value); setPage(1); }}>
          <option value="">All Actions</option>
          <option value="complaint.created">Complaint Created</option>
          <option value="complaint.assigned">Complaint Assigned</option>
          <option value="complaint.status_changed">Status Changed</option>
          <option value="complaint.resolved">Complaint Resolved</option>
          <option value="complaint.rejected">Complaint Rejected</option>
          <option value="staff.registered">Staff Registered</option>
          <option value="user.joined_workspace">User Joined</option>
        </select>
        <select className="input py-2 text-sm w-auto" value={actor} onChange={e => { setActor(e.target.value); setPage(1); }}>
          <option value="">All Actors</option>
          <option value="User">User</option>
          <option value="Staff">Staff</option>
          <option value="Admin">Admin</option>
        </select>
      </div>

      {loading ? <Loader /> : (
        <div className="space-y-2">
          {logs.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-3xl mb-2">📋</p>
              <p className="font-display font-600" style={{ color: 'var(--text-primary)' }}>No audit logs</p>
            </div>
          ) : logs.map(l => {
            const colorClass = Object.entries(ACTION_COLORS).find(([k]) => l.action?.includes(k.split('.')[1]))?.[1] || 'bg-gray-100 text-gray-600';
            return (
              <div key={l._id} className="card py-3 px-4 flex items-start gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-orange-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-mono font-medium ${colorClass}`}>{l.action}</span>
                    <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{l.actorModel}</span>
                  </div>
                  {l.metadata && (
                    <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>
                      {Object.entries(l.metadata).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                    </p>
                  )}
                </div>
                <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{formatDateTime(l.createdAt)}</span>
              </div>
            );
          })}
        </div>
      )}

      {Math.ceil(total / LIMIT) > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Page {page} of {Math.ceil(total / LIMIT)}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm py-2 disabled:opacity-40">Prev</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / LIMIT)} className="btn-secondary text-sm py-2 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
