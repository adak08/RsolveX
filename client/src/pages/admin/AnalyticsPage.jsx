import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import { useToast } from '../../components/common/Toast';

const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#ef4444', '#8b5cf6', '#f59e0b', '#14b8a6'];

const StatPill = ({ label, value, icon: Icon, color }) => (
  <div className="stat-card flex items-center gap-4">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={18} className="text-white" />
    </div>
    <div>
      <p className="text-xl font-display font-700" style={{ color: 'var(--text-primary)' }}>{value ?? '—'}</p>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  </div>
);

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30');
  const [exporting, setExporting] = useState(false);
  const [perfData, setPerfData] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [aRes, pRes] = await Promise.all([
        api.get(`/api/admin/analytics?range=${range}`),
        api.get('/api/admin/analytics/staff-performance').catch(() => ({ data: { data: [] } })),
      ]);
      // Backend: { summary, distributions, trends, geographic, timestamps }
      const raw = aRes.data?.data || aRes.data || {};
      const summary = raw.summary || {};
      const dist    = raw.distributions || {};
      setData({
        summary,
        stats: {
          total:          summary.totalComplaints    || 0,
          pending:        summary.pendingComplaints  || 0,
          resolved:       summary.resolvedComplaints || 0,
          resolutionRate: summary.resolutionRate     || 0,
          avgResolutionTime: summary.avgResolutionTime || 0,
        },
        trends: raw.trends || {},
        // Convert distribution objects to arrays for charts
        byCategory: Object.entries(dist.departments || {}).map(([name, value]) => ({ name, value })),
        byPriority: Object.entries(dist.priorities  || {}).map(([name, value]) => ({ name, value })),
        byStatus:   Object.entries(dist.status      || {}).map(([name, value]) => ({ name, value })),
      });
      setPerfData(Array.isArray(pRes.data?.data) ? pRes.data.data : []);
    } catch (e) { toast('Failed to load analytics', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [range]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.get('/api/admin/analytics/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `resolvex-analytics-${Date.now()}.csv`; a.click();
      window.URL.revokeObjectURL(url);
      toast('Export downloaded', 'success');
    } catch (e) { toast('Export failed', 'error'); }
    finally { setExporting(false); }
  };

  if (loading) return <Loader text="Loading analytics…" />;

  const stats      = data?.stats || {};
  const daily      = (data?.trends?.daily || []).map(d => ({
    day: new Date(d.date || d.day).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    complaints: d.complaints || 0, resolved: d.resolved || 0,
  }));
  const byCategory = data?.byCategory || [];
  const byPriority = data?.byPriority || [];
  const heatmap = data?.heatmap || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-700 text-2xl" style={{ color: 'var(--text-primary)' }}>Analytics</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Insights across your workspace</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 14, 30, 90].map(r => (
            <button key={r} onClick={() => setRange(String(r))}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${range === String(r) ? 'bg-orange-500 text-white shadow' : 'btn-secondary'}`}>
              {r}d
            </button>
          ))}
          <button onClick={handleExport} disabled={exporting} className="btn-secondary gap-2">
            <Download size={14} /> {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
          <button onClick={load} className="btn-secondary"><RefreshCw size={14} /></button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatPill label="Total Complaints" value={stats.total || 0} icon={TrendingUp} color="bg-orange-500" />
        <StatPill label="Resolution Rate" value={`${stats.resolutionRate || 0}%`} icon={CheckCircle} color="bg-green-500" />
        <StatPill label="Avg. Resolution" value={`${stats.avgResolutionHours || 0}h`} icon={Clock} color="bg-blue-500" />
        <StatPill label="Active Users" value={stats.activeUsers || 0} icon={Users} color="bg-violet-500" />
      </div>

      {/* Trend chart */}
      <div className="card">
        <h2 className="font-display font-600 text-base mb-4" style={{ color: 'var(--text-primary)' }}>Daily Trend ({range} days)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={daily}>
            <defs>
              <linearGradient id="gc1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.2} /><stop offset="95%" stopColor="#f97316" stopOpacity={0} /></linearGradient>
              <linearGradient id="gc2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
            <Legend />
            <Area type="monotone" dataKey="complaints" stroke="#f97316" strokeWidth={2} fill="url(#gc1)" name="New Complaints" />
            <Area type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} fill="url(#gc2)" name="Resolved" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category & Priority charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-display font-600 text-base mb-4" style={{ color: 'var(--text-primary)' }}>By Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byCategory} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis type="category" dataKey="_id" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} width={80} />
              <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-display font-600 text-base mb-4" style={{ color: 'var(--text-primary)' }}>By Priority</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byPriority} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="count" nameKey="_id">
                {byPriority.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Staff performance */}
      {perfData.length > 0 && (
        <div className="card">
          <h2 className="font-display font-600 text-base mb-4" style={{ color: 'var(--text-primary)' }}>Staff Performance</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={perfData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="resolved" fill="#22c55e" radius={[4, 4, 0, 0]} name="Resolved" />
              <Bar dataKey="assigned" fill="#f97316" radius={[4, 4, 0, 0]} name="Assigned" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
