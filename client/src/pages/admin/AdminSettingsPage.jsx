import React, { useState, useEffect } from 'react';
import { Save, Copy, RefreshCw, Building2, Settings, Users, Lock } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../components/common/Toast';
import { errMsg } from '../../utils/helpers';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', allowPublicComplaints: true, autoAssign: false, maxComplaintsPerUser: 10 });

  const load = async () => {
    try {
      const res = await api.get('/api/workspace/info');
      const w = res.data?.data || res.data;
      setWorkspace(w);
      setForm({
        name: w.name || '',
        description: w.description || '',
        allowPublicComplaints: w.settings?.allowPublicComplaints ?? true,
        autoAssign: w.settings?.autoAssign ?? false,
        maxComplaintsPerUser: w.settings?.maxComplaintsPerUser ?? 10,
      });
    } catch (e) { toast('Could not load workspace settings', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/api/workspace/settings', {
        name: form.name,
        description: form.description,
        settings: {
          allowPublicComplaints: form.allowPublicComplaints,
          autoAssign: form.autoAssign,
          maxComplaintsPerUser: form.maxComplaintsPerUser,
        },
      });
      toast('Settings saved successfully', 'success');
      load();
    } catch (e) { toast(errMsg(e), 'error'); }
    finally { setSaving(false); }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(workspace?.workspaceCode || '');
    toast('Workspace code copied!', 'success');
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-display font-700 text-2xl" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Manage your workspace configuration</p>
      </div>

      {/* Workspace code */}
      {workspace?.workspaceCode && (
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Lock size={16} className="text-orange-600" />
            </div>
            <h2 className="font-display font-600 text-base" style={{ color: 'var(--text-primary)' }}>Workspace Code</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 p-3 rounded-xl font-mono font-700 text-xl tracking-widest text-center" style={{ background: 'var(--bg-tertiary)', color: 'var(--accent)', border: '1px solid var(--border)' }}>
              {workspace.workspaceCode}
            </div>
            <button onClick={copyCode} className="btn-secondary gap-2"><Copy size={14} /> Copy</button>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Share this code with users and staff to join your workspace</p>
        </div>
      )}

      {/* Workspace info */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Building2 size={16} className="text-blue-600" />
          </div>
          <h2 className="font-display font-600 text-base" style={{ color: 'var(--text-primary)' }}>Workspace Info</h2>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Workspace Name</label>
          <input className="input" value={form.name} onChange={f('name')} />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
          <textarea className="input resize-none" rows={3} value={form.description} onChange={f('description')} />
        </div>
      </div>

      {/* Settings */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <Settings size={16} className="text-violet-600" />
          </div>
          <h2 className="font-display font-600 text-base" style={{ color: 'var(--text-primary)' }}>Complaint Settings</h2>
        </div>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Allow Public Complaints</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Unauthenticated users can view complaints</p>
          </div>
          <div className="relative">
            <input type="checkbox" className="sr-only" checked={form.allowPublicComplaints} onChange={f('allowPublicComplaints')} />
            <div className={`w-11 h-6 rounded-full transition-colors ${form.allowPublicComplaints ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`} onClick={() => setForm(p => ({ ...p, allowPublicComplaints: !p.allowPublicComplaints }))}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mt-1 ${form.allowPublicComplaints ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
          </div>
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Auto Assign</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Automatically assign complaints to available staff</p>
          </div>
          <div className="relative">
            <div className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${form.autoAssign ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`} onClick={() => setForm(p => ({ ...p, autoAssign: !p.autoAssign }))}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mt-1 ${form.autoAssign ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
          </div>
        </label>

        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Max Complaints Per User</label>
          <input className="input w-32" type="number" min={1} max={100} value={form.maxComplaintsPerUser} onChange={f('maxComplaintsPerUser')} />
        </div>
      </div>

      <button onClick={save} disabled={saving} className="btn-primary gap-2 disabled:opacity-50">
        <Save size={16} /> {saving ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  );
}
