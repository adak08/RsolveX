import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, RefreshCw, ChevronDown, Eye, UserCheck, CheckCircle, XCircle, MoreVertical, Users, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import Loader, { SkeletonCard } from '../../components/common/Loader';
import { StatusBadge, PriorityBadge, CategoryBadge, AiBadge } from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { timeAgo, errMsg, truncate } from '../../utils/helpers';
import { useToast } from '../../components/common/Toast';
import ComplaintDetailModal from '../../components/admin/ComplaintDetailModal';
import BulkAssignModal from '../../components/admin/BulkAssignModal';

const STATUSES = ['', 'pending', 'in-progress', 'resolved', 'rejected'];
const PRIORITIES = ['', 'low', 'medium', 'high', 'critical'];
const CATEGORIES = ['', 'road', 'water', 'electricity', 'sanitation', 'other'];

export default function AdminIssuesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [selected, setSelected] = useState([]);
  const [detailId, setDetailId] = useState(null);
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [staffList, setStaffList] = useState([]);

  const LIMIT = 12;

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, sort };
      if (search) params.search = search;
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (category) params.category = category;

      const res = await api.get('/api/admin/issues', { params });
      const payload = res.data;
      // Backend: { success, data: [...], pagination: { total, page, limit, totalPages } }
      setComplaints(Array.isArray(payload.data) ? payload.data : []);
      setTotal(payload.pagination?.total || 0);
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, status, priority, category, sort]);

  const fetchStaff = async () => {
    try {
      const res = await api.get('/api/admin/issues/staff');
      // Backend: { success, data: [...] }
      setStaffList(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {}
  };

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);
  useEffect(() => { fetchStaff(); }, []);

  const updateComplaint = async (id, updates) => {
    try {
      await api.put(`/api/admin/issues/${id}`, updates);
      toast('Updated successfully', 'success');
      fetchComplaints();
    } catch (e) { toast(errMsg(e), 'error'); }
  };

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const selectAll = () => setSelected(complaints.map(c => c._id));
  const clearSelect = () => setSelected([]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-700 text-2xl" style={{ color: 'var(--text-primary)' }}>Complaints</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{total} total complaints</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selected.length} selected</span>
              <button onClick={() => setShowBulkAssign(true)} className="btn-primary text-sm py-2">
                <Users size={14} /> Bulk Assign
              </button>
              <button onClick={clearSelect} className="btn-secondary text-sm py-2">Clear</button>
            </motion.div>
          )}
          <button onClick={fetchComplaints} className="btn-secondary"><RefreshCw size={14} /></button>
        </div>
      </div>

      {/* Filters */}
      <div className="card py-3 px-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            className="input pl-9 py-2 text-sm"
            placeholder="Search complaints…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="input py-2 text-sm w-auto" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          {STATUSES.map(s => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Status'}</option>)}
        </select>
        <select className="input py-2 text-sm w-auto" value={priority} onChange={e => { setPriority(e.target.value); setPage(1); }}>
          {PRIORITIES.map(p => <option key={p} value={p}>{p ? p.charAt(0).toUpperCase() + p.slice(1) : 'All Priority'}</option>)}
        </select>
        <select className="input py-2 text-sm w-auto" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c ? c.charAt(0).toUpperCase() + c.slice(1) : 'All Category'}</option>)}
        </select>
        <select className="input py-2 text-sm w-auto" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="-createdAt">Newest First</option>
          <option value="createdAt">Oldest First</option>
          <option value="-priority">Priority High→Low</option>
          <option value="priority">Priority Low→High</option>
        </select>
        {selected.length === 0 && (
          <button onClick={selectAll} className="btn-secondary text-sm py-2">Select All</button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3">{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : complaints.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-display font-600" style={{ color: 'var(--text-primary)' }}>No complaints found</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Try adjusting your filters</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                  <th className="w-10 p-3"><input type="checkbox" onChange={e => e.target.checked ? selectAll() : clearSelect()} checked={selected.length === complaints.length} /></th>
                  <th className="p-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Complaint</th>
                  <th className="p-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Category</th>
                  <th className="p-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Status</th>
                  <th className="p-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Priority</th>
                  <th className="p-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Assigned</th>
                  <th className="p-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Date</th>
                  <th className="p-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c._id} className="hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="p-3">
                      <input type="checkbox" checked={selected.includes(c._id)} onChange={() => toggleSelect(c._id)} onClick={e => e.stopPropagation()} />
                    </td>
                    <td className="p-3" onClick={() => setDetailId(c._id)}>
                      <div className="flex items-start gap-2">
                        {c.aiClassification?.classified && <span className="mt-0.5 text-[10px] px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/30 text-violet-600 font-medium">AI</span>}
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{truncate(c.title, 45)}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.user?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3"><CategoryBadge category={c.category} /></td>
                    <td className="p-3">
                      <select
                        className="text-xs px-2 py-1 rounded-lg border-0 outline-none cursor-pointer font-medium"
                        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                        value={c.status}
                        onChange={e => { e.stopPropagation(); updateComplaint(c._id, { status: e.target.value }); }}
                        onClick={e => e.stopPropagation()}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="p-3"><PriorityBadge priority={c.priority} /></td>
                    <td className="p-3">
                      {c.assignedTo ? (
                        <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                          {c.assignedTo?.name || 'Assigned'}
                        </span>
                      ) : (
                        <select
                          className="text-xs px-2 py-1 rounded-lg border-0 outline-none cursor-pointer"
                          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
                          value=""
                          onChange={e => { if (e.target.value) updateComplaint(c._id, { assignedTo: e.target.value }); }}
                          onClick={e => e.stopPropagation()}
                        >
                          <option value="">Assign staff…</option>
                          {staffList.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                      )}
                    </td>
                    <td className="p-3 text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(c.createdAt)}</td>
                    <td className="p-3">
                      <button onClick={() => setDetailId(c._id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--bg-tertiary)] transition-colors" style={{ color: 'var(--text-muted)' }}>
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm py-2 disabled:opacity-40">Prev</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary text-sm py-2 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {/* Modals */}
      {detailId && <ComplaintDetailModal id={detailId} onClose={() => setDetailId(null)} onUpdate={fetchComplaints} staffList={staffList} />}
      {showBulkAssign && (
        <BulkAssignModal
          selectedIds={selected}
          staffList={staffList}
          onClose={() => setShowBulkAssign(false)}
          onSuccess={() => { setShowBulkAssign(false); clearSelect(); fetchComplaints(); }}
        />
      )}
    </div>
  );
}
