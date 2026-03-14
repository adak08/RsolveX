import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ThumbsUp, MapPin, RefreshCw } from 'lucide-react';
import api from '../../api/axios';
import ComplaintCard from '../../components/common/ComplaintCard';
import Loader, { SkeletonCard } from '../../components/common/Loader';
import ComplaintDetailModal from '../../components/user/ComplaintDetailModal';
import { errMsg } from '../../utils/helpers';
import { useToast } from '../../components/common/Toast';

const CATS = ['', 'road', 'water', 'electricity', 'sanitation', 'other'];
const STATS = ['', 'pending', 'in-progress', 'resolved', 'rejected'];

export default function AllComplaints() {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const LIMIT = 12;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, sort };
      if (search) params.search = search;
      if (category) params.category = category;
      if (status) params.status = status;
      const res = await api.get('/api/user_issues', { params });
      // Backend: { success, data: [...], pagination }
      setComplaints(Array.isArray(res.data?.data) ? res.data.data : []);
      setTotal(d.total || d.pagination?.total || 0);
    } catch (e) { toast(errMsg(e), 'error'); }
    finally { setLoading(false); }
  }, [page, search, category, status, sort]);

  useEffect(() => { load(); }, [load]);

  const vote = async (id) => {
    try {
      await api.put(`/api/user_issues/${id}/vote`);
      load();
    } catch (e) { toast(errMsg(e), 'error'); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-700 text-2xl" style={{ color: 'var(--text-primary)' }}>All Complaints</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{total} complaints in workspace</p>
        </div>
        <button onClick={load} className="btn-secondary"><RefreshCw size={14} /></button>
      </div>

      <div className="card py-3 px-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-40">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input pl-9 py-2 text-sm" placeholder="Search…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="input py-2 text-sm w-auto" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
          {CATS.map(c => <option key={c} value={c}>{c ? c.charAt(0).toUpperCase() + c.slice(1) : 'All Categories'}</option>)}
        </select>
        <select className="input py-2 text-sm w-auto" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          {STATS.map(s => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Status'}</option>)}
        </select>
        <select className="input py-2 text-sm w-auto" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="-voteCount">Most Voted</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : complaints.length === 0 ? (
        <div className="card text-center py-16"><p className="text-4xl mb-2">📭</p><p className="font-display font-600" style={{ color: 'var(--text-primary)' }}>No complaints found</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complaints.map(c => <ComplaintCard key={c._id} complaint={c} onClick={setSelected} onVote={vote} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm py-2 disabled:opacity-40">Prev</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary text-sm py-2 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {selected && <ComplaintDetailModal complaint={selected} onClose={() => { setSelected(null); load(); }} />}
    </div>
  );
}
