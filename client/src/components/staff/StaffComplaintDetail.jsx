import React, { useState, useEffect } from 'react';
import { Send, MapPin, Clock, User, Pencil, Trash2 } from 'lucide-react';
import Modal from '../common/Modal';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../common/Badge';
import { formatDateTime, timeAgo, getInitials, avatarBg, errMsg } from '../../utils/helpers';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';

export default function StaffComplaintDetail({ id, onClose }) {
  const { authStatus } = useAuth();
  const { toast } = useToast();
  const [complaint, setComplaint] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState('details');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [adminReceiverId, setAdminReceiverId] = useState('');

  const myId = authStatus.userData?._id;

  const loadMessages = async () => {
    const r = await api.get(`/api/staff/issues/${id}/chat`).catch(() => ({ data: {} }));
    // Backend chat returns: { success, data: [...] }
    setMessages(Array.isArray(r.data?.data) ? r.data.data : []);
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        // Fetch all staff complaints and find the one we need
        const cRes = await api.get('/api/staff/issues');
        const list = Array.isArray(cRes.data?.data) ? cRes.data.data : [];
        setComplaint(list.find(c => c._id === id) || null);
        const adminRes = await api.get('/api/staff/issues/admins/list').catch(() => ({ data: {} }));
        setAdminReceiverId(adminRes.data?.data?.adminId || '');
        await loadMessages();
      } catch {}
      finally { setLoading(false); }
    };
    loadAll();
  }, [id]);

  const send = async () => {
    if (!text.trim()) return;
    if (!adminReceiverId) {
      toast('Admin receiver unavailable for this workspace chat', 'warning');
      return;
    }
    setSending(true);
    try {
      await api.post(`/api/staff/issues/${id}/chat`, {
        message: text.trim(),
        receiverId: adminReceiverId,
      });
      setText('');
      await loadMessages();
    } catch (e) { toast(errMsg(e), 'error'); }
    finally { setSending(false); }
  };

  const saveEdit = async (msgId) => {
    try {
      await api.patch(`/api/chat/message/${msgId}/edit`, { message: editText });
      setEditId(null);
      await loadMessages();
    } catch (e) { toast(errMsg(e), 'error'); }
  };

  const deleteMsg = async (msgId) => {
    try {
      await api.delete(`/api/chat/message/${msgId}/delete`);
      await loadMessages();
    } catch (e) { toast(errMsg(e), 'error'); }
  };

  return (
    <Modal open onClose={onClose} size="lg" title={loading ? 'Loading…' : complaint?.title}>
      {loading ? (
        <div className="py-12 flex justify-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : complaint ? (
        <div className="space-y-4">
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
            {['details', 'chat'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-white dark:bg-[var(--bg-secondary)] shadow-sm' : ''}`}
                style={{ color: tab === t ? 'var(--accent)' : 'var(--text-muted)' }}>{t}</button>
            ))}
          </div>
          {tab === 'details' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2"><CategoryBadge category={complaint.category} /><StatusBadge status={complaint.status} /><PriorityBadge priority={complaint.priority} /></div>
              <div className="p-4 rounded-xl text-sm leading-relaxed" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{complaint.description}</div>
              {complaint.images?.length > 0 && (
                <div className="grid grid-cols-3 gap-2">{complaint.images.map((img, i) => <img key={i} src={img} alt="" className="w-full h-24 object-cover rounded-xl cursor-pointer" onClick={() => window.open(img)} />)}</div>
              )}
              <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center gap-2"><User size={14} style={{ color: 'var(--text-muted)' }} />{complaint.user?.name}</div>
                <div className="flex items-center gap-2"><Clock size={14} style={{ color: 'var(--text-muted)' }} />{formatDateTime(complaint.createdAt)}</div>
                {complaint.location?.address && <div className="flex items-center gap-2"><MapPin size={14} style={{ color: 'var(--text-muted)' }} />{complaint.location.address}</div>}
              </div>
            </div>
          )}
          {tab === 'chat' && (
            <div className="flex flex-col h-72">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}><p className="text-3xl mb-2">💬</p><p className="text-sm">No messages yet</p></div>
                ) : messages.map(m => {
                  const isMe = m.senderId === myId || m.senderId?._id === myId;
                  return (
                    <div key={m._id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarBg(m.senderName || 'S')}`}>{getInitials(m.senderName || 'S')}</div>
                      <div className={`group max-w-xs flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {editId === m._id ? (
                          <div className="flex gap-2">
                            <input className="input text-sm py-1.5 px-3 w-40" value={editText} onChange={e => setEditText(e.target.value)} />
                            <button onClick={() => saveEdit(m._id)} className="btn-primary text-xs py-1.5 px-3">Save</button>
                            <button onClick={() => setEditId(null)} className="btn-secondary text-xs py-1.5 px-3">✕</button>
                          </div>
                        ) : (
                          <div className={`px-3 py-2 rounded-2xl text-sm ${isMe ? 'rounded-br-sm bg-orange-500 text-white' : 'rounded-bl-sm'}`} style={!isMe ? { background: 'var(--bg-tertiary)', color: 'var(--text-primary)' } : {}}>{m.message}</div>
                        )}
                        <div className={`flex items-center gap-1.5 mt-0.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{timeAgo(m.createdAt)}</span>
                          {isMe && <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditId(m._id); setEditText(m.message); }} className="w-5 h-5 flex items-center justify-center rounded" style={{ color: 'var(--text-muted)' }}><Pencil size={11} /></button>
                            <button onClick={() => deleteMsg(m._id)} className="w-5 h-5 flex items-center justify-center rounded hover:text-red-500" style={{ color: 'var(--text-muted)' }}><Trash2 size={11} /></button>
                          </div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <input className="input flex-1 text-sm py-2.5" placeholder={adminReceiverId ? 'Type a message…' : 'Admin receiver unavailable'} value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} disabled={!adminReceiverId} />
                <button onClick={send} disabled={sending || !text.trim() || !adminReceiverId} className="btn-primary px-3 disabled:opacity-50"><Send size={15} /></button>
              </div>
            </div>
          )}
        </div>
      ) : <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>Could not load complaint</p>}
    </Modal>
  );
}
