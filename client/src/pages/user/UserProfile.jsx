import React, { useState, useEffect } from 'react';
import { User, Phone, Save, Building2, Hash, MapPin } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { getInitials, avatarBg, errMsg } from '../../utils/helpers';

export default function UserProfile() {
  const { authStatus } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '' });
  const [workspaceCode, setWorkspaceCode] = useState('');
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/users/profile');
        const u = res.data?.data || res.data;
        setForm({ name: u.name || '', phone: u.phone || '', street: u.address?.street || '', city: u.address?.city || '', state: u.address?.state || '', pincode: u.address?.pincode || '' });
        setWorkspace(u.workspace || null);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/api/users/profile', { name: form.name, phone: form.phone, address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode } });
      localStorage.setItem('user', JSON.stringify({ ...authStatus.userData, name: form.name }));
      toast('Profile updated', 'success');
    } catch (e) { toast(errMsg(e), 'error'); }
    finally { setSaving(false); }
  };

  const joinWorkspace = async () => {
    const code = workspaceCode.trim();
    if (!code) return;

    setJoining(true);
    try {
      const res = await api.post('/api/workspace/join/user', { workspaceCode: code });
      const profileRes = await api.get('/api/users/profile');
      const updated = profileRes.data?.data || profileRes.data;
      localStorage.setItem('user', JSON.stringify(updated));
      setWorkspace(updated.workspace || res.data?.workspace || null);
      setWorkspaceCode('');
      window.dispatchEvent(new Event('userLogin'));
      toast(`Joined ${res.data?.workspace?.name || 'workspace'} successfully`, 'success');
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-lg space-y-6 animate-fade-in">
      <h1 className="font-display font-700 text-2xl" style={{ color: 'var(--text-primary)' }}>Profile</h1>

      {/* Avatar */}
      <div className="card flex items-center gap-5">
        <div className="relative">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold ${avatarBg(authStatus.userName)}`}>
            {getInitials(authStatus.userName)}
          </div>
        </div>
        <div>
          <p className="font-display font-600 text-lg" style={{ color: 'var(--text-primary)' }}>{authStatus.userName}</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{authStatus.userData?.email}</p>
          <span className="badge mt-1" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>Citizen</span>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-display font-600 text-base" style={{ color: 'var(--text-primary)' }}>Personal Info</h2>
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
          <div className="relative"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} /><input className="input pl-10" value={form.name} onChange={f('name')} /></div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Phone</label>
          <div className="relative"><Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} /><input className="input pl-10" value={form.phone} onChange={f('phone')} maxLength={10} /></div>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-display font-600 text-base" style={{ color: 'var(--text-primary)' }}>Address</h2>
        <input className="input" placeholder="Street" value={form.street} onChange={f('street')} />
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="City" value={form.city} onChange={f('city')} />
          <input className="input" placeholder="State" value={form.state} onChange={f('state')} />
        </div>
        <input className="input w-36" placeholder="Pincode" value={form.pincode} onChange={f('pincode')} maxLength={6} />
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <Building2 size={18} style={{ color: 'var(--accent)' }} />
          <h2 className="font-display font-600 text-base" style={{ color: 'var(--text-primary)' }}>Workspace</h2>
        </div>

        {workspace ? (
          <div className="rounded-2xl p-4" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{workspace.name}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Code: {workspace.workspaceCode}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              You can raise complaints only in your joined workspace.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl p-4 space-y-3" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Join a workspace after signup so you can submit complaints and see workspace-specific data.
            </p>
            <div className="relative">
              <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                className="input pl-10"
                placeholder="Enter workspace code"
                value={workspaceCode}
                onChange={(e) => setWorkspaceCode(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={joinWorkspace}
              disabled={joining || !workspaceCode.trim()}
              className="btn-primary w-full justify-center disabled:opacity-50"
            >
              {joining ? 'Joining…' : 'Join Workspace'}
            </button>
          </div>
        )}
      </div>

      <button onClick={save} disabled={saving} className="btn-primary gap-2 disabled:opacity-50">
        <Save size={16} />{saving ? 'Saving…' : 'Save Profile'}
      </button>
    </div>
  );
}
