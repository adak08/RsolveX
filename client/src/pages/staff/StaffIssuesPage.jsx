import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Eye } from 'lucide-react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/common/Badge';
import { timeAgo, errMsg, truncate } from '../../utils/helpers';
import { useToast } from '../../components/common/Toast';
import Modal from '../../components/common/Modal';
import StaffComplaintDetail from '../../components/staff/StaffComplaintDetail';

export default function StaffIssuesPage() {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [detailId, setDetailId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      const res = await api.get('/api/staff/issues', { params });
      // Backend: { success, data: [...], count }
      setComplaints(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (e) { toast(errMsg(e), 'error'); }
    finally { setLoading(false); }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const filtered = complaints.filter(c =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/api/staff/issues/${id}`, { status: newStatus });
      toast('Status updated', 'success');
      load();
    } catch (e) { toast(errMsg(e), 'error'); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-700 text-2xl" style={{ color: 'var(--text-primary)' }}>My Issues</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{filtered.length} assigned to you</p>
        </div>
        <button onClick={load} className="btn-secondary"><RefreshCw size={14} /></button>
      </div>

      <div className="card py-3 px-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input pl-9 py-2 text-sm" placeholder="Search issues…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input py-2 text-sm w-auto" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {loading ? <Loader /> : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-2">📋</p>
          <p className="font-display font-600" style={{ color: 'var(--text-primary)' }}>No issues assigned</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map(c => (
            <div key={c._id} className="card py-3 px-4 flex items-start gap-4 hover:border-orange-200 dark:hover:border-orange-800 transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <CategoryBadge category={c.category} />
                  <PriorityBadge priority={c.priority} />
                </div>
                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{c.title}</p>
                <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{c.description}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>By {c.user?.name} · {timeAgo(c.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  className="text-xs px-2 py-1.5 rounded-lg border-0 outline-none cursor-pointer font-medium"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                  value={c.status}
                  onChange={e => updateStatus(c._id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                <button onClick={() => setDetailId(c._id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-tertiary)] transition-colors" style={{ color: 'var(--text-muted)' }}>
                  <Eye size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {detailId && (
        <StaffComplaintDetail id={detailId} onClose={() => { setDetailId(null); load(); }} />
      )}
    </div>
  );
}
