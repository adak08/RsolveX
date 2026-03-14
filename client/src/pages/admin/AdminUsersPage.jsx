import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import { getInitials, avatarBg, timeAgo, errMsg } from '../../utils/helpers';
import { useToast } from '../../components/common/Toast';

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/workspace/members');
      // Backend: { success, data: { users: [...], staff: [...] } }
      const d = res.data?.data || {};
      setUsers(Array.isArray(d.users) ? d.users : []);
      setTotal(d.users?.length || 0);
    } catch (e) {
      // Fallback: just show a message
      toast('Could not load users — check workspace permissions', 'warning');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, search]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-700 text-2xl" style={{ color: 'var(--text-primary)' }}>Users</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{total} members in workspace</p>
        </div>
        <button onClick={load} className="btn-secondary"><RefreshCw size={14} /></button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input className="input pl-9 text-sm" placeholder="Search users…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>

      {loading ? <Loader /> : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                <th className="p-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>User</th>
                <th className="p-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Email</th>
                <th className="p-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Phone</th>
                <th className="p-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Verified</th>
                <th className="p-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="hover:bg-[var(--bg-secondary)] transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${avatarBg(u.name)}`}>{getInitials(u.name)}</div>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
                    </div>
                  </td>
                  <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{u.phone || '—'}</td>
                  <td className="p-3">
                    {u.isVerified ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-400" />}
                  </td>
                  <td className="p-3 text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(u.createdAt)}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No users found</td></tr>
              )}
            </tbody>
          </table>
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
