import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, Pencil, Trash2, MessageSquare } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { timeAgo, getInitials, avatarBg, errMsg } from '../../utils/helpers';
import { useToast } from '../../components/common/Toast';
import socketService from '../../services/socketService';

export default function StaffChatPage() {
  const { authStatus } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [search, setSearch] = useState('');
  const bottomRef = useRef();
  const myId = authStatus.userData?._id;

  const loadConversations = async () => {
    try {
      const res = await api.get('/api/chat/conversations');
      // Backend aggregate returns array of { _id: conversationId, lastMessage: {...}, unreadCount }
      // We need to shape this for the UI: extract otherUser details from lastMessage
      const myIdStr = myId?.toString();
      const shaped = (res.data?.data || []).map(conv => {
        const lm = conv.lastMessage || {};
        const senderIdStr = lm.senderId?._id?.toString() || lm.senderId?.toString();
        const isMe = senderIdStr === myIdStr;
        const otherUser = isMe ? lm.receiverId : lm.senderId;
        return {
          conversationId: conv._id,
          otherUserId:    otherUser?._id || otherUser,
          otherUserName:  otherUser?.name || 'Unknown',
          lastMessage:    lm.message || '',
          unreadCount:    conv.unreadCount || 0,
          updatedAt:      lm.createdAt,
        };
      });
      setConversations(shaped);
    } catch {}
    finally { setLoading(false); }
  };

  const loadMessages = async (otherUserId) => {
    if (!otherUserId) return;
    try {
      const res = await api.get(`/api/chat/conversation/${otherUserId}`);
      // Backend: { success, data: { messages: [...], unreadCount, conversationId } }
      const d = res.data?.data || {};
      setMessages(Array.isArray(d.messages) ? d.messages : (Array.isArray(d) ? d : []));
    } catch {}
  };

  useEffect(() => {
    loadConversations();
    const sock = socketService.getSocket();
    if (sock) {
      sock.on('new_message', (msg) => {
        if (activeConv && (msg.conversationId === activeConv.conversationId)) {
          setMessages(p => [...p, msg]);
        }
        loadConversations();
      });
    }
    return () => socketService.off('new_message');
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConv = async (conv) => {
    setActiveConv(conv);
    await loadMessages(conv.otherUserId || conv._id);
    // mark as read
    try { await api.patch(`/api/chat/conversation/${conv.conversationId}/read`); } catch {}
  };

  const send = async () => {
    if (!text.trim() || !activeConv) return;
    setSending(true);
    try {
      await api.post('/api/chat/send', {
        receiverId: activeConv.otherUserId,
        receiverModel: activeConv.otherUserModel || 'Admin',
        message: text.trim(),
      });
      setText('');
      await loadMessages(activeConv.otherUserId || activeConv._id);
    } catch (e) { toast(errMsg(e), 'error'); }
    finally { setSending(false); }
  };

  const saveEdit = async (id) => {
    try {
      await api.patch(`/api/chat/message/${id}/edit`, { message: editText });
      setEditId(null);
      if (activeConv) loadMessages(activeConv.otherUserId || activeConv._id);
    } catch (e) { toast(errMsg(e), 'error'); }
  };

  const deleteMsg = async (id) => {
    try {
      await api.delete(`/api/chat/message/${id}/delete`);
      if (activeConv) loadMessages(activeConv.otherUserId || activeConv._id);
    } catch (e) { toast(errMsg(e), 'error'); }
  };

  const filtered = conversations.filter(c =>
    !search || c.otherUserName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full gap-4 animate-fade-in" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Conversation list */}
      <div className="w-64 shrink-0 flex flex-col card p-0 overflow-hidden">
        <div className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-display font-600 text-sm mb-2" style={{ color: 'var(--text-primary)' }}>Messages</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input className="input pl-8 py-2 text-sm" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-xl shimmer" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>
              <MessageSquare size={24} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">No conversations</p>
            </div>
          ) : filtered.map(conv => (
            <button
              key={conv.conversationId || conv._id}
              onClick={() => openConv(conv)}
              className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-[var(--bg-secondary)] ${activeConv?.conversationId === conv.conversationId ? 'bg-orange-50 dark:bg-orange-950/20' : ''}`}
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarBg(conv.otherUserName)}`}>
                {getInitials(conv.otherUserName || 'U')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{conv.otherUserName || 'Unknown'}</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{conv.lastMessage || 'No messages yet'}</p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {conv.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col card p-0 overflow-hidden">
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center" style={{ color: 'var(--text-muted)' }}>
            <MessageSquare size={40} className="mb-3 opacity-20" />
            <p className="text-sm">Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-5 py-3.5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold ${avatarBg(activeConv.otherUserName)}`}>
                {getInitials(activeConv.otherUserName || 'U')}
              </div>
              <div>
                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{activeConv.otherUserName || 'Unknown'}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{activeConv.otherUserModel || 'Admin'}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.map(m => {
                const isMe = m.senderId === myId || m.senderId?._id === myId;
                return (
                  <div key={m._id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarBg(isMe ? authStatus.userName : activeConv.otherUserName)}`}>
                      {getInitials(isMe ? authStatus.userName : (activeConv.otherUserName || 'U'))}
                    </div>
                    <div className={`group max-w-sm flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {editId === m._id ? (
                        <div className="flex gap-2 items-center">
                          <input className="input text-sm py-1.5 px-3 w-48" value={editText} onChange={e => setEditText(e.target.value)} />
                          <button onClick={() => saveEdit(m._id)} className="btn-primary text-xs py-1.5 px-3">Save</button>
                          <button onClick={() => setEditId(null)} className="btn-secondary text-xs py-1.5 px-3">✕</button>
                        </div>
                      ) : (
                        <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-full ${isMe ? 'rounded-br-sm bg-orange-500 text-white' : 'rounded-bl-sm'}`}
                          style={!isMe ? { background: 'var(--bg-tertiary)', color: 'var(--text-primary)' } : {}}>
                          {m.message}
                          {m.isEdited && <span className="text-[10px] ml-1 opacity-60">(edited)</span>}
                        </div>
                      )}
                      <div className={`flex items-center gap-2 mt-0.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{timeAgo(m.createdAt)}</span>
                        {isMe && editId !== m._id && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditId(m._id); setEditText(m.message); }} className="w-5 h-5 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}><Pencil size={11} /></button>
                            <button onClick={() => deleteMsg(m._id)} className="w-5 h-5 flex items-center justify-center hover:text-red-500 transition-colors" style={{ color: 'var(--text-muted)' }}><Trash2 size={11} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-5 py-3 flex gap-3" style={{ borderTop: '1px solid var(--border)' }}>
              <input
                className="input flex-1"
                placeholder="Type a message…"
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              />
              <button onClick={send} disabled={sending || !text.trim()} className="btn-primary px-4 disabled:opacity-50">
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
