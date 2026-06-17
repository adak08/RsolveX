import React, { useState, useEffect } from 'react';
import { Save, Copy, Building2, Settings, Lock } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../components/common/Toast';
import { errMsg } from '../../utils/helpers';
import ToggleSwitch from '../../components/common/ToggleSwitch';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    allowPublicComplaints: true, 
    autoAssign: false, 
    aiClassification: true,
    staffAssignmentAlgorithm: 'least-busy',
    maxComplaintsPerUser: 10 
  });

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
        aiClassification: w.settings?.aiClassification ?? true,
        staffAssignmentAlgorithm: w.settings?.staffAssignmentAlgorithm ?? 'least-busy',
        maxComplaintsPerUser: w.settings?.maxComplaintsPerUser ?? 10,
      });
    } catch (e) { 
      toast('Could not load workspace settings', 'error'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/api/workspace/settings', {
        name: form.name,
        description: form.description,
        settings: {
          // Flatten settings object structure for the backend controller
          allowPublicComplaints: form.allowPublicComplaints,
          autoAssign: form.autoAssign,
          aiClassification: form.aiClassification,
          staffAssignmentAlgorithm: form.staffAssignmentAlgorithm,
          maxComplaintsPerUser: parseInt(form.maxComplaintsPerUser, 10),
        },
        // The backend explicitly unpacks these if provided flat, so we provide flat variants as well just in case:
        allowPublicComplaints: form.allowPublicComplaints,
        autoAssign: form.autoAssign,
        aiClassification: form.aiClassification,
        staffAssignmentAlgorithm: form.staffAssignmentAlgorithm,
        maxComplaintsPerUser: parseInt(form.maxComplaintsPerUser, 10),
      });
      toast('Settings saved successfully', 'success');
      load();
    } catch (e) { 
      toast(errMsg(e), 'error'); 
    } finally { 
      setSaving(false); 
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(workspace?.workspaceCode || '');
    toast('Workspace code copied!', 'success');
  };

  const handleTextChange = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const handleToggleChange = (k) => (val) => setForm(p => ({ ...p, [k]: val }));

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
          <input className="input" value={form.name} onChange={handleTextChange('name')} />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
          <textarea className="input resize-none" rows={3} value={form.description} onChange={handleTextChange('description')} />
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

        <div className="space-y-2">
          <ToggleSwitch
            id="toggle-public"
            label="Allow Public Complaints"
            description="Unauthenticated users can view complaints"
            checked={form.allowPublicComplaints}
            onChange={handleToggleChange('allowPublicComplaints')}
            loading={saving}
            disabled={saving}
          />
          
          <ToggleSwitch
            id="toggle-ai"
            label="Enable AI Classification"
            description="Automatically categorize and prioritize 'Other' category complaints using Gemini AI"
            checked={form.aiClassification}
            onChange={handleToggleChange('aiClassification')}
            loading={saving}
            disabled={saving}
          />

          <ToggleSwitch
            id="toggle-assign"
            label="Auto Assign Complaints"
            description="Automatically assign incoming complaints to the best available staff member"
            checked={form.autoAssign}
            onChange={handleToggleChange('autoAssign')}
            loading={saving}
            disabled={saving}
          />
        </div>

        {form.autoAssign && (
          <div className="pl-4 border-l-2 border-orange-500/20 mt-4 py-2 space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Assignment Algorithm</label>
              <select 
                className="input" 
                value={form.staffAssignmentAlgorithm} 
                onChange={handleTextChange('staffAssignmentAlgorithm')}
                disabled={saving}
              >
                <option value="least-busy">Least Busy (Recommended)</option>
                <option value="expertise">Strict Expertise Matching</option>
                <option value="round-robin">Round Robin</option>
              </select>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Determines how the assignment engine selects the best candidate.
              </p>
            </div>
          </div>
        )}

        <div className="pt-2 border-t mt-4" style={{ borderColor: 'var(--border)' }}>
          <label className="text-sm font-medium block mb-1.5 mt-2" style={{ color: 'var(--text-secondary)' }}>Max Complaints Per User</label>
          <input 
            className="input w-32" 
            type="number" 
            min={1} 
            max={100} 
            value={form.maxComplaintsPerUser} 
            onChange={handleTextChange('maxComplaintsPerUser')} 
            disabled={saving}
          />
        </div>
      </div>

      <button onClick={save} disabled={saving} className="btn-primary gap-2 disabled:opacity-50">
        <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}
