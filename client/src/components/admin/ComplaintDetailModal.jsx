import React, { useState, useEffect } from 'react';
import { MapPin, User, Clock, Star, AlertCircle, Phone, Mail, Building, Info, MessageSquare } from 'lucide-react';
import Modal from '../common/Modal';
import { StatusBadge, PriorityBadge, CategoryBadge, AiBadge } from '../common/Badge';
import { formatDateTime, errMsg } from '../../utils/helpers';
import { useToast } from '../common/Toast';
import api from '../../api/axios';
import AdminComplaintChat from './AdminComplaintChat';
import AuditTimeline from '../audit/AuditTimeline';

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
    <Modal open={true} onClose={onClose} size="xl" title={loading ? 'Loading…' : "Complaint Details"}>
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
            <div className="space-y-6">
              
              {/* HEADER SECTION */}
              <div className="space-y-3 pb-4 border-b border-gray-200 dark:border-gray-800">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="text-orange-500 w-5 h-5" />
                  {complaint.title}
                  <span className="text-xs uppercase font-bold tracking-wider px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-500 ml-2">
                    {complaint.status}
                  </span>
                </h1>
                
                <div className="flex flex-wrap items-center gap-3">
                  <PriorityBadge priority={complaint.priority} />
                  <CategoryBadge category={complaint.category} />
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    Created {formatDateTime(complaint.createdAt)}
                  </div>
                  {complaint.updatedAt && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      Updated {formatDateTime(complaint.updatedAt)}
                    </div>
                  )}
                </div>
              </div>

              {/* TWO COLUMN LAYOUT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* LEFT COLUMN */}
                <div className="space-y-6">
                  {/* Description */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                      <Info className="w-4 h-4" /> Description
                    </h3>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      {complaint.description || "No description provided."}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" /> Location
                    </h3>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm">
                      <p className="font-medium text-gray-900 dark:text-white mb-1">
                        {complaint.location?.address || "Address not available"}
                      </p>
                      {complaint.location?.latitude && complaint.location?.longitude && (
                        <p className="text-gray-500 font-mono text-xs">
                          Coordinates: {complaint.location.latitude.toFixed(4)}°N, {complaint.location.longitude.toFixed(4)}°E
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Comments Thread */}
                  {complaint.comments?.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4" /> Comments Thread
                      </h3>
                      <div className="space-y-3">
                        {complaint.comments.map((c, i) => (
                          <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl relative">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-gray-900 dark:text-gray-200">
                                {c.staff?.name || c.admin?.name || 'Staff Member'}
                              </span>
                              <span className="text-[10px] text-gray-500">{formatDateTime(c.createdAt)}</span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{c.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Rating */}
                  {complaint.rating?.score && (
                    <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                        <Star className="w-4 h-4" /> Rating
                      </h3>
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl text-sm border border-amber-100 dark:border-amber-900/30">
                        <div className="flex items-center gap-2 mb-2 text-amber-500 font-bold">
                          <Star className="w-4 h-4 fill-amber-500" />
                          {complaint.rating.score} / 5
                        </div>
                        {complaint.rating.comment && (
                          <p className="text-amber-800 dark:text-amber-200 italic">"{complaint.rating.comment}"</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Update controls */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/80 rounded-xl space-y-3 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Admin Actions</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Status</label>
                        <select className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" value={statusVal} onChange={e => setStatusVal(e.target.value)}>
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Priority</label>
                        <select className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" value={priorityVal} onChange={e => setPriorityVal(e.target.value)}>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Assign Staff</label>
                      <select className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" value={assignVal} onChange={e => setAssignVal(e.target.value)}>
                        <option value="">Unassigned</option>
                        {staffList.map(s => <option key={s._id} value={s._id}>{s.name} ({s.staffId})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Add Comment (optional)</label>
                      <textarea className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none" rows={2} placeholder="Admin notes…" value={comment} onChange={e => setComment(e.target.value)} />
                    </div>
                    <button onClick={update} disabled={updating} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50">
                      {updating ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-6">
                  {/* Raised By */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                      <User className="w-4 h-4" /> Raised By
                    </h3>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-1 text-sm">
                      <p className="font-bold text-gray-900 dark:text-white">{complaint.user?.name || 'Unknown User'}</p>
                      <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5" /> {complaint.user?.email || 'N/A'}
                      </p>
                      {complaint.user?.phone && (
                        <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5" /> {complaint.user.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Assigned To */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                      <User className="w-4 h-4" /> Assigned To
                    </h3>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl space-y-1 text-sm">
                      {complaint.assignedTo ? (
                        <>
                          <p className="font-bold text-blue-900 dark:text-blue-100">{complaint.assignedTo.name}</p>
                          <p className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
                            <span className="font-mono text-xs px-1.5 py-0.5 bg-blue-200 dark:bg-blue-800 rounded">{complaint.assignedTo.staffId || 'N/A'}</span>
                          </p>
                          {complaint.assignedTo.email && (
                            <p className="text-blue-700 dark:text-blue-300 flex items-center gap-2 mt-1.5">
                              <Mail className="w-3.5 h-3.5" /> {complaint.assignedTo.email}
                            </p>
                          )}
                          {complaint.department?.name && (
                            <p className="text-blue-700 dark:text-blue-300 flex items-center gap-2 mt-1.5">
                              <Building className="w-3.5 h-3.5" /> {complaint.department.name}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-blue-600 dark:text-blue-400 italic">Unassigned</p>
                      )}
                    </div>
                  </div>

                  {/* AI Classification */}
                  {complaint.aiClassification?.classified && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-violet-500 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> AI Classification
                      </h3>
                      <div className="p-4 bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/30 rounded-xl space-y-2 text-sm">
                        <div className="flex gap-2 mb-2">
                          <span className="text-xs font-bold bg-violet-200 dark:bg-violet-800 text-violet-800 dark:text-violet-200 px-2 py-1 rounded">
                            {complaint.category.toUpperCase()}
                          </span>
                          <span className="text-xs font-bold bg-violet-200 dark:bg-violet-800 text-violet-800 dark:text-violet-200 px-2 py-1 rounded">
                            {complaint.priority.toUpperCase()} PRIORITY
                          </span>
                        </div>
                        <p className="text-violet-800 dark:text-violet-200">
                          <span className="font-semibold text-xs uppercase tracking-wide opacity-70">Reasoning:</span>
                          <br />
                          "{complaint.aiClassification.reasoning}"
                        </p>
                        {complaint.aiClassification.originalInput && (
                          <p className="text-violet-800 dark:text-violet-200 mt-2 pt-2 border-t border-violet-200 dark:border-violet-800/50">
                            <span className="font-semibold text-xs uppercase tracking-wide opacity-70">Original Input:</span>
                            <br />
                            <span className="italic">"{complaint.aiClassification.originalInput}"</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Images */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                      <Info className="w-4 h-4" /> Images
                    </h3>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      {complaint.images?.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                          {complaint.images.map((img, i) => (
                            <img key={i} src={img} alt={`Complaint Image ${i}`} className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity border border-gray-200 dark:border-gray-700 shadow-sm" onClick={() => window.open(img, '_blank')} />
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No images attached.</p>
                      )}
                    </div>
                  </div>

                  {/* Votes */}
                  {complaint.voteCount > 0 && (
                    <div className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                      👍 {complaint.voteCount} community {complaint.voteCount === 1 ? 'vote' : 'votes'}
                    </div>
                  )}

                </div>
              </div>
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
    <div className="space-y-3 p-2">
      <AuditTimeline logs={logs} />
    </div>
  );
}
