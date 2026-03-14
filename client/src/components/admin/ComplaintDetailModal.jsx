import React, { useState, useEffect } from 'react';
import { MapPin, User, Clock, MessageSquare, Star, Send, X, ChevronDown } from 'lucide-react';
import Modal from '../common/Modal';
import { StatusBadge, PriorityBadge, CategoryBadge, AiBadge } from '../common/Badge';
import { formatDateTime, errMsg } from '../../utils/helpers';
import { useToast } from '../common/Toast';
import api from '../../api/axios';
import AdminComplaintChat from './AdminComplaintChat';

export default function ComplaintDetailModal({ id, onClose, onUpdate, staffList = [] }) {
  const { toast } = useToast();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('details');
  const [updating, setUpdating] = useState(false);
  const [statusVal, setStatusVal] = useState('');
  const [priorityVal, setPriorityVal] = useState('');
  const [assignVal, setAssignVal] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/admin/issues/${id}`);
        const c = res.data?.data || res.data;
        setComplaint(c);
        setStatusVal(c.status);
        setPriorityVal(c.priority);
        setAssignVal(c.assignedTo?._id || c.assignedTo || '');
      } catch (e) { toast(errMsg(e), 'error'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const update = async () => {
    setUpdating(true);
    try {
      await api.put(`/api/admin/issues/${id}`, {
        status: statusVal,
        priority: priorityVal,
        assignedTo: assignVal || undefined,
        comment: comment || undefined,
      });
      toast('Complaint updated', 'success');
      onUpdate?.();
      onClose();
    } catch (e) { toast(errMsg(e), 'error'); }
    finally { setUpdating(false); }
  };

  const TABS = ['details', 'chat', 'audit'];

  return (
    <Modal open={true} onClose={onClose} size="lg" title={loading ? 'Loading…' : complaint?.title}>
      {loading ? (
        <div className="py-12 flex justify-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : complaint && (
        <div className="space-y-5">
          {/* Tab bar */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-white dark:bg-[var(--bg-secondary)] shadow-sm text-orange-600' : ''}`}
                style={{ color: tab === t ? 'var(--accent)' : 'var(--text-muted)' }}>
                {t}
              </button>
            ))}
          </div>

          {tab === 'details' && (
            <div className="space-y-5">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <CategoryBadge category={complaint.category} />
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
                {complaint.aiClassification?.classified && <AiBadge reasoning={complaint.aiClassification.reasoning} />}
              </div>

              {/* Description */}
              <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{complaint.description}</p>
              </div>

              {/* AI info */}
              {complaint.aiClassification?.classified && (
                <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <p className="font-medium text-violet-600 mb-1">✦ AI Classification</p>
                  <p style={{ color: 'var(--text-secondary)' }}>{complaint.aiClassification.reasoning}</p>
                </div>
              )}

              {/* Images */}
              {complaint.images?.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {complaint.images.map((img, i) => (
                    <img key={i} src={img} alt={`img-${i}`} className="w-full h-24 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(img)} />
                  ))}
                </div>
              )}

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <User size={14} style={{ color: 'var(--text-muted)' }} />
                  <span>{complaint.user?.name || 'Unknown User'}</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                  <span>{formatDateTime(complaint.createdAt)}</span>
                </div>
                {complaint.location?.address && (
                  <div className="flex items-center gap-2 col-span-2" style={{ color: 'var(--text-secondary)' }}>
                    <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                    <span>{complaint.location.address}</span>
                  </div>
                )}
                {complaint.voteCount > 0 && (
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <span>👍 {complaint.voteCount} votes</span>
                  </div>
                )}
                {complaint.rating?.score && (
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <Star size={14} className="text-amber-500" />
                    <span>{complaint.rating.score}/5 — {complaint.rating.comment}</span>
                  </div>
                )}
              </div>

              {/* Update controls */}
              <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Update Complaint</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Status</label>
                    <select className="input py-2 text-sm" value={statusVal} onChange={e => setStatusVal(e.target.value)}>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Priority</label>
                    <select className="input py-2 text-sm" value={priorityVal} onChange={e => setPriorityVal(e.target.value)}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Assign Staff</label>
                  <select className="input py-2 text-sm" value={assignVal} onChange={e => setAssignVal(e.target.value)}>
                    <option value="">Unassigned</option>
                    {staffList.map(s => <option key={s._id} value={s._id}>{s.name} ({s.staffId})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Add Comment (optional)</label>
                  <textarea className="input resize-none text-sm" rows={2} placeholder="Update notes…" value={comment} onChange={e => setComment(e.target.value)} />
                </div>
                <button onClick={update} disabled={updating} className="btn-primary disabled:opacity-50">
                  {updating ? 'Saving…' : 'Save Changes'}
                </button>
              </div>

              {/* Existing comments */}
              {complaint.comments?.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Staff Comments</p>
                  <div className="space-y-2">
                    {complaint.comments.map((c, i) => (
                      <div key={i} className="p-3 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>{c.message}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{formatDateTime(c.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'chat' && <AdminComplaintChat complaintId={id} receiverId={complaint?.assignedTo?._id || complaint?.assignedTo} />}

          {tab === 'audit' && <ComplaintAuditTab entityId={id} />}
        </div>
      )}
    </Modal>
  );
}

function ComplaintAuditTab({ entityId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/audit/${entityId}`).then(r => {
      setLogs(r.data?.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [entityId]);

  if (loading) return <div className="py-8 flex justify-center"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-2">
      {logs.length === 0 ? (
        <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No audit logs for this complaint</p>
      ) : logs.map(l => (
        <div key={l._id} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="w-2 h-2 mt-1.5 rounded-full bg-orange-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{l.action?.replace(/\./g, ' → ')}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{l.actorModel} · {formatDateTime(l.createdAt)}</p>
            {l.metadata && (
              <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>{JSON.stringify(l.metadata)}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
