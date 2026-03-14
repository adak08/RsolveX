import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Calendar, User, UserCog, Send, Edit2, Loader2, Star, MessageSquare, ChevronDown } from 'lucide-react';
import { adminService } from '../../services';
import { formatDateTime, capitalize } from '../../utils/helpers';
import { StatusBadge, PriorityBadge, CategoryIcon, Avatar } from '../common/UI';

const ComplaintDetail = ({ id, onClose, staffList = [], onUpdate }) => {
  const [complaint, setComplaint] = useState(null);
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatMsg, setChatMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [editing, setEditing] = useState({ status: '', priority: '', assignedTo: '' });
  const [saving, setSaving] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchDetail();
    fetchChat();
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const fetchDetail = async () => {
    try {
      const res = await adminService.getIssueById(id);
      const c = res.data?.data || res.data;
      setComplaint(c);
      setEditing({
        status: c.status,
        priority: c.priority,
        assignedTo: c.assignedTo?._id || '',
      });
    } catch { } finally { setLoading(false); }
  };

  const fetchChat = async () => {
    try {
      const res = await adminService.getComplaintChat(id);
      setChat(res.data?.data || []);
    } catch { }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminService.updateIssue(id, editing);
      fetchDetail();
      onUpdate?.();
    } catch { } finally { setSaving(false); }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    setSending(true);
    try {
      const res = await adminService.sendComplaintChat(id, { message: chatMsg });
      setChat(prev => [...prev, res.data?.data]);
      setChatMsg('');
    } catch { } finally { setSending(false); }
  };

  const hasChanges = complaint && (
    editing.status !== complaint.status ||
    editing.priority !== complaint.priority ||
    editing.assignedTo !== (complaint.assignedTo?._id || '')
  );

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/40" />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-xl flex flex-col overflow-hidden"
        style={{ background: 'var(--bg-primary)', borderLeft: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
            <X className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {loading ? '…' : complaint?.title}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Complaint Detail</p>
          </div>
          {hasChanges && (
            <button onClick={handleSave} disabled={saving} className="btn-primary py-1.5 text-xs">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save changes'}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
          ) : complaint ? (
            <div className="p-5 space-y-5">
              {/* Info */}
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl" style={{ background: 'var(--bg-secondary)' }}>
                    <CategoryIcon category={complaint.category} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{complaint.title}</h2>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {capitalize(complaint.category)} · {formatDateTime(complaint.createdAt)}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{complaint.description}</p>

                {/* AI Classification */}
                {complaint.aiClassification?.classified && (
                  <div className="mt-3 p-3 rounded-xl border text-sm" style={{ background: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.2)' }}>
                    <p className="text-xs font-semibold text-blue-500 mb-1">🤖 AI Classification</p>
                    <p style={{ color: 'var(--text-secondary)' }}>{complaint.aiClassification.reasoning}</p>
                  </div>
                )}
              </div>

              {/* Images */}
              {complaint.images?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Attachments</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {complaint.images.map((img, i) => (
                      <img key={i} src={img} alt="" className="w-24 h-24 rounded-xl object-cover shrink-0 cursor-pointer hover:opacity-90" onClick={() => window.open(img, '_blank')} />
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              {complaint.location?.address && (
                <div className="flex items-center gap-2 text-sm p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{complaint.location.address}</span>
                </div>
              )}

              {/* Reporter */}
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                <Avatar name={complaint.user?.name} size="sm" />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{complaint.user?.name || 'Anonymous'}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{complaint.user?.email}</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <Star className="w-3.5 h-3.5" /> {complaint.voteCount || 0} votes
                </div>
              </div>

              {/* Rating */}
              {complaint.rating?.score && (
                <div className="p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <p className="text-xs font-semibold text-green-600 mb-1">User Rating</p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < complaint.rating.score ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    {complaint.rating.comment && <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{complaint.rating.comment}</p>}
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Actions</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Status</label>
                    <select className="input py-2 text-sm" value={editing.status} onChange={e => setEditing(p => ({ ...p, status: e.target.value }))}>
                      {['pending', 'in-progress', 'resolved', 'rejected'].map(s => (
                        <option key={s} value={s}>{capitalize(s)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Priority</label>
                    <select className="input py-2 text-sm" value={editing.priority} onChange={e => setEditing(p => ({ ...p, priority: e.target.value }))}>
                      {['low', 'medium', 'high', 'critical'].map(s => (
                        <option key={s} value={s}>{capitalize(s)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Assign To</label>
                    <select className="input py-2 text-sm" value={editing.assignedTo} onChange={e => setEditing(p => ({ ...p, assignedTo: e.target.value }))}>
                      <option value="">Unassigned</option>
                      {staffList.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Chat */}
              <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                  <MessageSquare className="w-3.5 h-3.5" /> Staff Chat ({chat.length})
                </p>
                <div className="space-y-3 max-h-48 overflow-y-auto no-scrollbar mb-3">
                  {chat.length === 0 ? (
                    <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>No messages yet</p>
                  ) : chat.map((msg, i) => {
                    const isAdmin = msg.senderModel === 'Admin';
                    return (
                      <div key={i} className={`flex gap-2 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                        <Avatar name={msg.senderId?.name || 'A'} size="sm" />
                        <div className={`max-w-xs px-3 py-2 rounded-xl text-sm ${isAdmin ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                          style={{ background: isAdmin ? 'var(--accent)' : 'var(--bg-secondary)', color: isAdmin ? 'white' : 'var(--text-primary)' }}>
                          {msg.message}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendChat} className="flex gap-2">
                  <input
                    className="input flex-1 py-2 text-sm"
                    placeholder="Send a message…"
                    value={chatMsg}
                    onChange={e => setChatMsg(e.target.value)}
                  />
                  <button type="submit" disabled={!chatMsg.trim() || sending} className="btn-primary py-2 px-3">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </div>

              {/* Comments by staff */}
              {complaint.comments?.length > 0 && (
                <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Staff Comments</p>
                  <div className="space-y-3">
                    {complaint.comments.map((c, i) => (
                      <div key={i} className="flex gap-2">
                        <Avatar name={c.staff?.name || 'S'} size="sm" />
                        <div className="flex-1 p-3 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)' }}>
                          <p className="font-medium text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{c.staff?.name || 'Staff'}</p>
                          <p style={{ color: 'var(--text-primary)' }}>{c.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-sm" style={{ color: 'var(--text-muted)' }}>
              Complaint not found
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ComplaintDetail;
