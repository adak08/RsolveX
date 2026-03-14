// ─── Analytics Page ──────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Download, RefreshCw, TrendingUp, Users, Award } from 'lucide-react';
import { adminService } from '../../services';
import { capitalize } from '../../utils/helpers';
import { Skeleton, Avatar } from '../../components/common/UI';

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  useEffect(() => { fetchData(); }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, perfRes] = await Promise.allSettled([
        adminService.getAnalytics({ range }),
        adminService.getStaffPerformance(),
      ]);
      setData({
        analytics: analyticsRes.value?.data?.data || analyticsRes.value?.data || {},
        staffPerf: perfRes.value?.data?.data || [],
      });
    } catch { } finally { setLoading(false); }
  };

  const handleExport = async () => {
    try {
      const res = await adminService.exportAnalytics({ format: 'csv' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = 'analytics.csv'; a.click();
    } catch { }
  };

  const PIE_COLORS = ['#f97316', '#3b82f6', '#22c55e', '#ef4444'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="card shadow-lg py-2 px-3 text-xs space-y-1">
        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>)}
      </div>
    );
  };

  if (loading) return <div className="p-6 space-y-4">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-48 w-full" />)}</div>;

  const { analytics, staffPerf } = data || {};
  const pieData = [
    { name: 'Pending', value: analytics?.pending || 0 },
    { name: 'In Progress', value: analytics?.inProgress || 0 },
    { name: 'Resolved', value: analytics?.resolved || 0 },
    { name: 'Rejected', value: analytics?.rejected || 0 },
  ];
  const trendData = analytics?.dailyTrend || [];
  const catData = analytics?.categoryBreakdown || [];

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Analytics</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Performance metrics for your workspace</p>
        </div>
        <div className="flex gap-2">
          <select value={range} onChange={e => setRange(e.target.value)} className="input py-2 text-sm w-28">
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
            <option value="90d">90 days</option>
          </select>
          <button onClick={handleExport} className="btn-secondary py-2 px-3 text-sm"><Download className="w-4 h-4" /> Export</button>
          <button onClick={fetchData} className="btn-secondary py-2 px-3"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Resolution Rate', value: `${analytics?.resolutionRate?.toFixed(1) || 0}%`, icon: TrendingUp, color: 'text-green-500' },
          { label: 'Avg Resolution Time', value: `${analytics?.avgResolutionTime?.toFixed(1) || 0}d`, icon: Award, color: 'text-blue-500' },
          { label: 'Total Users', value: analytics?.users || 0, icon: Users, color: 'text-purple-500' },
          { label: 'Active Staff', value: analytics?.staff || 0, icon: Users, color: 'text-orange-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <Icon className={`w-5 h-5 mb-3 ${color}`} />
            <p className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Trend + Pie */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 card">
          <h2 className="font-display font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Daily Complaint Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} /><stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="complaints" name="Complaints" stroke="#f97316" strokeWidth={2} fill="url(#g1)" />
              <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#22c55e" strokeWidth={2} fill="none" strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h2 className="font-display font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Status Distribution</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
              {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
            </Pie><Tooltip content={<CustomTooltip />} /></PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.name}: <strong>{d.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category chart */}
      {catData.length > 0 && (
        <div className="card">
          <h2 className="font-display font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>By Category</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={catData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Staff performance */}
      {staffPerf?.length > 0 && (
        <div className="card">
          <h2 className="font-display font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Staff Performance</h2>
          <div className="space-y-3">
            {staffPerf.map((s, i) => (
              <div key={s._id || i} className="flex items-center gap-3">
                <span className="text-xs font-mono w-6 text-right" style={{ color: 'var(--text-muted)' }}>#{i + 1}</span>
                <Avatar name={s.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                      <div className="h-full rounded-full" style={{ width: `${s.resolutionRate || 70}%`, background: 'var(--accent)' }} />
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.resolutionRate || 0}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.resolvedCount || 0}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>resolved</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Audit Logs Page ──────────────────────────────────────────────────────────
import { auditService } from '../../services';
import { formatDateTime } from '../../utils/helpers';
import { Search, Filter, ClipboardList } from 'lucide-react';
import { EmptyState } from '../../components/common/UI';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ action: '', actorModel: '' });

  useEffect(() => { fetchLogs(); }, [page, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditService.getLogs({ page, limit: 20, ...filters });
      setLogs(res.data?.data || []);
      setTotal(res.data?.pagination?.total || 0);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch { } finally { setLoading(false); }
  };

  const actionColor = (action) => {
    if (action?.includes('created')) return 'text-green-500';
    if (action?.includes('rejected') || action?.includes('deleted')) return 'text-red-500';
    if (action?.includes('resolved')) return 'text-blue-500';
    return 'text-amber-500';
  };

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Audit Logs</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{total} total actions</p>
        </div>
        <button onClick={fetchLogs} className="btn-secondary py-2 px-3"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <select value={filters.action} onChange={e => setFilters(f => ({ ...f, action: e.target.value }))} className="input py-2 text-sm w-48">
          <option value="">All Actions</option>
          <option value="complaint.created">Complaint Created</option>
          <option value="complaint.assigned">Assigned</option>
          <option value="complaint.status_changed">Status Changed</option>
          <option value="complaint.rejected">Rejected</option>
          <option value="staff.registered">Staff Registered</option>
          <option value="user.joined_workspace">User Joined</option>
        </select>
        <select value={filters.actorModel} onChange={e => setFilters(f => ({ ...f, actorModel: e.target.value }))} className="input py-2 text-sm w-36">
          <option value="">All Roles</option>
          <option value="User">User</option>
          <option value="Staff">Staff</option>
          <option value="Admin">Admin</option>
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="grid grid-cols-5 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide border-b" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>
          <span className="col-span-2">Action</span>
          <span>Actor</span>
          <span className="hidden md:block">Role</span>
          <span>Time</span>
        </div>
        {loading ? (
          <div className="p-4 space-y-2">{Array.from({length:8}).map((_,i)=><Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : logs.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No audit logs" description="Actions in your workspace will appear here" />
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {logs.map(log => (
              <div key={log._id} className="grid grid-cols-5 px-4 py-3 items-center hover:opacity-90 transition-all" style={{ background: 'transparent' }}>
                <div className="col-span-2">
                  <p className={`text-sm font-mono font-medium ${actionColor(log.action)}`}>{log.action}</p>
                  {log.metadata && (
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                      {Object.entries(log.metadata).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </p>
                  )}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{log.actorId?.name || '—'}</div>
                <div className="hidden md:block">
                  <span className={`badge text-xs ${log.actorModel === 'Admin' ? 'badge-critical' : log.actorModel === 'Staff' ? 'badge-in-progress' : 'badge-resolved'}`}>
                    {log.actorModel}
                  </span>
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDateTime(log.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm" style={{ borderColor: 'var(--border)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-50">Previous</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Workspace Settings Page ──────────────────────────────────────────────────
import { workspaceService } from '../../services';
import { Save, Copy, Check, Building, Globe, Shield } from 'lucide-react';
import { WORKSPACE_TYPES } from '../../constants';

export const AdminSettingsPage = () => {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', type: 'other', allowPublicComplaints: true, autoAssign: false, maxComplaintsPerUser: 10 });

  useEffect(() => { fetchWs(); }, []);

  const fetchWs = async () => {
    try {
      const res = await workspaceService.getInfo();
      const ws = res.data?.data || res.data;
      setWorkspace(ws);
      setForm({
        name: ws.name || '',
        description: ws.description || '',
        type: ws.type || 'other',
        allowPublicComplaints: ws.settings?.allowPublicComplaints ?? true,
        autoAssign: ws.settings?.autoAssign ?? false,
        maxComplaintsPerUser: ws.settings?.maxComplaintsPerUser ?? 10,
      });
    } catch { } finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await workspaceService.updateSettings({
        name: form.name,
        description: form.description,
        type: form.type,
        settings: { allowPublicComplaints: form.allowPublicComplaints, autoAssign: form.autoAssign, maxComplaintsPerUser: form.maxComplaintsPerUser },
      });
      fetchWs();
    } catch { } finally { setSaving(false); }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(workspace?.workspaceCode || '');
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  if (loading) return <div className="p-6"><Skeleton className="h-96 w-full" /></div>;

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="section-title">Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage your workspace configuration</p>
      </div>

      {/* Workspace code */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <h2 className="font-display font-semibold" style={{ color: 'var(--text-primary)' }}>Workspace Code</h2>
        </div>
        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Share this code with users and staff to join your workspace.</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 px-4 py-3 rounded-xl font-mono text-lg font-bold tracking-widest text-center" style={{ background: 'var(--bg-secondary)', color: 'var(--accent)' }}>
            {workspace?.workspaceCode || '—'}
          </div>
          <button onClick={copyCode} className="btn-secondary py-3 px-4">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Workspace info */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Building className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <h2 className="font-display font-semibold" style={{ color: 'var(--text-primary)' }}>Organisation Details</h2>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Workspace Name</label>
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Description</label>
          <textarea className="input resize-none" rows={2} value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Type</label>
          <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
            {WORKSPACE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
      </div>

      {/* Settings toggles */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <h2 className="font-display font-semibold" style={{ color: 'var(--text-primary)' }}>Complaint Settings</h2>
        </div>
        {[
          { key: 'allowPublicComplaints', label: 'Allow public complaints', desc: 'Non-members can view complaints' },
          { key: 'autoAssign', label: 'Auto-assign complaints', desc: 'Automatically assign to available staff' },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
            <button
              onClick={() => set(key, !form[key])}
              className={`w-11 h-6 rounded-full transition-all relative ${form[key] ? '' : 'bg-gray-300 dark:bg-gray-600'}`}
              style={{ background: form[key] ? 'var(--accent)' : undefined }}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${form[key] ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        ))}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Max complaints per user</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Limit complaints per user</p>
          </div>
          <input
            type="number"
            min={1} max={100}
            value={form.maxComplaintsPerUser}
            onChange={e => set('maxComplaintsPerUser', Number(e.target.value))}
            className="input w-20 py-2 text-sm text-center"
          />
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary px-8 py-3">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Changes
      </button>
    </div>
  );
};
