import React, { useState, useEffect, useRef } from 'react';
import { Send, Pencil, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { timeAgo, getInitials, avatarBg, errMsg } from '../../utils/helpers';
import { useToast } from '../common/Toast';

export default function AdminComplaintChat({ complaintId, receiverId }) {
  const { authStatus } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const bottomRef = useRef();

  const myId = authStatus.userData?._id;

  const loadMessages = async () => {
    try {
      const res = await api.get(`/api/admin/issues/${complaintId}/chat`);
      // Backend: { success, data: [...] }
      setMessages(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { loadMessages(); }, [complaintId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!text.trim()) return;
    if (!receiverId) {
      toast('Assign this complaint to a staff member before starting chat', 'warning');
      return;
    }
    setSending(true);
    try {
      await api.post(`/api/admin/issues/${complaintId}/chat`, {
        message: text.trim(),
        receiverId,
      });
      setText('');
      loadMessages();
    } catch (e) { toast(errMsg(e), 'error'); }
    finally { setSending(false); }
  };

  const saveEdit = async (id) => {
    try {
      await api.patch(`/api/chat/message/${id}/edit`, { message: editText });
      setEditId(null);
      loadMessages();
    } catch (e) { toast(errMsg(e), 'error'); }
  };

  const deleteMsg = async (id) => {
    try {
      await api.delete(`/api/chat/message/${id}/delete`);
      loadMessages();
    } catch (e) { toast(errMsg(e), 'error'); }
  };

  if (loading) return (
    <div className="py-8 flex justify-center">
      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col h-80">
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}>
            <p className="text-3xl mb-2">💬</p>
            <p className="text-sm">No messages yet. Start the conversation.</p>
          </div>
        ) : messages.map(m => {
          const isMe = m.senderId === myId || m.senderId?._id === myId;
          return (
            <div key={m._id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarBg(m.senderName || 'U')}`}>
                {getInitials(m.senderName || 'U')}
              </div>
              <div className={`group max-w-xs ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {editId === m._id ? (
                  <div className="flex gap-2">
                    <input
                      className="input text-sm py-1.5 px-3 w-48"
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                    />
                    <button onClick={() => saveEdit(m._id)} className="btn-primary text-xs py-1.5 px-3">Save</button>
                    <button onClick={() => setEditId(null)} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
                  </div>
                ) : (
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm max-w-full ${isMe ? 'rounded-br-sm bg-orange-500 text-white' : 'rounded-bl-sm'}`}
                    style={!isMe ? { background: 'var(--bg-tertiary)', color: 'var(--text-primary)' } : {}}
                  >
                    {m.message}
                    {m.isEdited && <span className="text-[10px] ml-1 opacity-60">(edited)</span>}
                  </div>
                )}
                <div className={`flex items-center gap-2 mt-0.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{timeAgo(m.createdAt)}</span>
                  {isMe && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditId(m._id); setEditText(m.message); }}
                        className="w-5 h-5 flex items-center justify-center rounded"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        onClick={() => deleteMsg(m._id)}
                        className="w-5 h-5 flex items-center justify-center rounded hover:text-red-500 transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <input
          className="input flex-1 text-sm py-2.5"
          placeholder={receiverId ? 'Type a message…' : 'Assign a staff member to enable chat'}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          disabled={!receiverId}
        />
        <button
          onClick={send}
          disabled={sending || !text.trim() || !receiverId}
          className="btn-primary px-3 disabled:opacity-50"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
