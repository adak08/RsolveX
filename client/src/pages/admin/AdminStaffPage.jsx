import React, { useState, useEffect } from 'react';
import { Search, UserPlus, ToggleLeft, ToggleRight, Star, Award, RefreshCw } from 'lucide-react';
import api from '../../api/axios';
import Loader, { SkeletonCard } from '../../components/common/Loader';
import { getInitials, avatarBg, timeAgo, errMsg } from '../../utils/helpers';
import { useToast } from '../../components/common/Toast';

export default function AdminStaffPage() {
  const { toast } = useToast();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, lRes] = await Promise.all([
        api.get('/api/admin/issues/staff'),
        api.get('/api/leaderboard').catch(() => ({ data: { data: [] } })),
      ]);
      setStaff(Array.isArray(sRes.data?.data) ? sRes.data.data : []);
      // Leaderboard: { success, data: [...], pagination }
      setLeaderboard(Array.isArray(lRes.data?.data) ? lRes.data.data : []);
    } catch (e) { toast(errMsg(e), 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (s) => {
    try {
      await api.put(`/api/admin/issues/${s._id}`, { isActive: !s.isActive });
      toast(`${s.name} ${!s.isActive ? 'activated' : 'deactivated'}`, 'success');
      load();
    } catch (e) { toast(errMsg(e), 'error'); }
  };

  const filtered = staff.filter(s =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()) || s.staffId?.toLowerCase().includes(search.toLowerCase())
  );

  const getRank = (staffId) => {
    const idx = leaderboard.findIndex(l => l.userId?._id === staffId || l.userId === staffId);
    return idx >= 0 ? idx + 1 : null;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-700 text-2xl" style={{ color: 'var(--text-primary)' }}>Staff</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{staff.length} members</p>
        </div>
        <button onClick={load} className="btn-secondary"><RefreshCw size={14} /></button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input className="input pl-9 text-sm" placeholder="Search staff…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-3xl mb-2">👥</p>
          <p className="font-display font-600" style={{ color: 'var(--text-primary)' }}>No staff found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => {
            const rank = getRank(s._id);
            return (
              <div key={s._id} className="card-hover space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${avatarBg(s.name)}`}>
                      {getInitials(s.name)}
                    </div>
                    <div>
                      <p className="font-display font-600 text-base" style={{ color: 'var(--text-primary)' }}>{s.name}</p>
                      <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{s.staffId}</p>
                    </div>
                  </div>
                  {rank && (
                    <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600">
                      <Award size={12} /> #{rank}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <p className="truncate">{s.email}</p>
                  {s.phone && <p>{s.phone}</p>}
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Joined {timeAgo(s.createdAt)}</p>
                </div>

                <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className={`badge ${s.isActive ? 'badge-resolved' : 'badge-rejected'}`}>
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => toggleActive(s)}
                    className="flex items-center gap-1.5 text-xs transition-colors hover:text-orange-500"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {s.isActive ? <ToggleRight size={16} className="text-green-500" /> : <ToggleLeft size={16} />}
                    {s.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
