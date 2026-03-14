import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Building2, FileText, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import { errMsg } from '../../utils/helpers';
import { WORKSPACE_TYPES } from '../../constants';

export default function WorkspaceRegisterForm({ onSuccess, onBack }) {
  const [form, setForm] = useState({ adminName: '', adminEmail: '', adminPassword: '', workspaceName: '', workspaceType: 'other', workspaceDesc: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleCreate = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.post('/api/workspace/register', {
        name: form.adminName, email: form.adminEmail, password: form.adminPassword,
        workspaceName: form.workspaceName, workspaceType: form.workspaceType, description: form.workspaceDesc,
      });
      localStorage.setItem('adminToken', res.data.accessToken);
      localStorage.setItem('adminData', JSON.stringify(res.data.admin));
      setDone(res.data.workspace);
      window.dispatchEvent(new Event('userLogin'));
    } catch (e) { setError(errMsg(e)); } finally { setLoading(false); }
  };

  if (done) return (
    <div className="text-center py-4 space-y-4">
      <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
        <CheckCircle size={28} className="text-green-600" />
      </div>
      <div>
        <h3 className="font-display font-700 text-lg" style={{ color: 'var(--text-primary)' }}>Workspace Created!</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Share this code with your team</p>
      </div>
      <div className="p-4 rounded-xl text-center" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Workspace Code</p>
        <p className="font-mono font-700 text-2xl tracking-widest" style={{ color: 'var(--accent)' }}>{done.workspaceCode}</p>
      </div>
      <button onClick={() => onSuccess('admin')} className="btn-primary w-full justify-center">Go to Dashboard <ArrowRight size={16} /></button>
    </div>
  );

  return (
    <div className="space-y-4">
      {error && <div className="p-3 rounded-xl text-sm text-red-600 bg-red-50 dark:bg-red-950/30">{error}</div>}

      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Admin Account</p>
      <div className="space-y-3">
        <div className="relative"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} /><input className="input pl-10" placeholder="Your name" value={form.adminName} onChange={f('adminName')} /></div>
        <div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} /><input className="input pl-10" placeholder="Admin email" value={form.adminEmail} onChange={f('adminEmail')} type="email" /></div>
        <div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} /><input className="input pl-10 pr-10" placeholder="Password" value={form.adminPassword} onChange={f('adminPassword')} type={showPw ? 'text' : 'password'} /><button onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
      </div>

      <p className="text-sm font-medium pt-1" style={{ color: 'var(--text-secondary)' }}>Workspace Details</p>
      <div className="space-y-3">
        <div className="relative"><Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} /><input className="input pl-10" placeholder="Workspace name (e.g. IIT Delhi)" value={form.workspaceName} onChange={f('workspaceName')} /></div>
        <select className="input" value={form.workspaceType} onChange={f('workspaceType')}>
          {WORKSPACE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <div className="relative"><FileText size={16} className="absolute left-3 top-3" style={{ color: 'var(--text-muted)' }} /><textarea className="input pl-10 resize-none" rows={2} placeholder="Short description (optional)" value={form.workspaceDesc} onChange={f('workspaceDesc')} /></div>
      </div>

      <div className="flex gap-3 pt-1">
        <button onClick={onBack} className="btn-secondary flex-shrink-0"><ArrowLeft size={15} /> Back</button>
        <button onClick={handleCreate} disabled={loading || !form.adminName || !form.adminEmail || !form.adminPassword || !form.workspaceName} className="btn-primary flex-1 justify-center disabled:opacity-50">
          {loading ? 'Creating…' : 'Create Workspace'} {!loading && <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  );
}
