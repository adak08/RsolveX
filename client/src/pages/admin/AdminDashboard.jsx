import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Users, UserCheck, CheckCircle, Clock, TrendingUp, RefreshCw, ArrowRight, BarChart3, ClipboardList } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import { timeAgo } from '../../utils/helpers';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';

const StatCard = ({ label, value, icon: Icon, color, sub, onClick }) => (
  <motion.div whileHover={{ y: -3 }} onClick={onClick} className={`stat-card cursor-pointer ${onClick ? 'hover:border-orange-400' : ''}`}>
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
    <p className="text-2xl font-display font-700" style={{ color: 'var(--text-primary)' }}>{value ?? '—'}</p>
    <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</p>
    {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
  </motion.div>
);

const COLORS = ['#f97316','#3b82f6','#22c55e','#ef4444','#8b5cf6'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setRefreshing(true);
      const [analyticsRes, issuesRes] = await Promise.all([
        api.get('/api/admin/analytics').catch(() => ({ data: {} })),
        api.get('/api/admin/issues?limit=8&sort=-createdAt').catch(() => ({ data: {} })),
      ]);
      setData({
        analytics: analyticsRes.data?.data || analyticsRes.data || {},
        // Backend: { success, data: [...], pagination }
        recentIssues: Array.isArray(issuesRes.data?.data) ? issuesRes.data.data : [],
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loader text="Loading dashboard…" />;

  const a = data?.analytics || {};
  // Backend returns: { summary, distributions, trends, geographic, timestamps }
  const summary = a.summary || {};
  const stats = {
    total:          summary.totalComplaints    || 0,
    pending:        summary.pendingComplaints  || 0,
    inProgress:     summary.inProgressComplaints || 0,
    resolved:       summary.resolvedComplaints || 0,
    resolutionRate: summary.resolutionRate     || 0,
    activeStaff:    0,  // not returned by analytics — shown as 0
  };
  const trends = a.trends?.daily || [];
  // Distributions come as plain objects { pending: N, resolved: N, ... }
  const distStatus = a.distributions?.status || {};
  const byStatus = Object.keys(distStatus).length
    ? Object.entries(distStatus).map(([name, value]) => ({ name, value }))
    : [];
  const distDept = a.distributions?.departments || {};
  const byCategory = Object.keys(distDept).length
    ? Object.entries(distDept).map(([name, value]) => ({ name, value }))
    : [];
  const recentIssues = data?.recentIssues || [];

  const chartTrend = trends.slice(-14).map(d => ({
    day: new Date(d.date || d.day).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    complaints: d.complaints || 0,
    resolved: d.resolved || 0,
  }));

  const pieData = byStatus.length
    ? byStatus
    : [
        { name: 'Pending',     value: stats.pending    || 0 },
        { name: 'In Progress', value: stats.inProgress || 0 },
        { name: 'Resolved',    value: stats.resolved   || 0 },
      ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-700 text-2xl" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Overview of your workspace</p>
        </div>
        <button onClick={load} className="btn-secondary gap-2" disabled={refreshing}>
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Complaints" value={stats.total || 0} icon={AlertCircle} color="bg-orange-500" onClick={() => navigate('/admin/issues')} />
        <StatCard label="Pending" value={stats.pending || 0} icon={Clock} color="bg-amber-500" sub="Awaiting action" onClick={() => navigate('/admin/issues?status=pending')} />
        <StatCard label="Resolved" value={stats.resolved || 0} icon={CheckCircle} color="bg-green-500" sub={`${stats.resolutionRate || 0}% rate`} onClick={() => navigate('/admin/issues?status=resolved')} />
        <StatCard label="Active Staff" value={stats.activeStaff || 0} icon={UserCheck} color="bg-blue-500" onClick={() => navigate('/admin/staff')} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-600 text-base" style={{ color: 'var(--text-primary)' }}>Complaint Trends</h2>
            <button onClick={() => navigate('/admin/analytics')} className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1">View analytics <ArrowRight size={12} /></button>
          </div>
          {chartTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartTrend}>
                <defs>
                  <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="complaints" stroke="#f97316" strokeWidth={2} fill="url(#cGrad)" name="Total" />
                <Area type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} fill="url(#rGrad)" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>No trend data available</div>
          )}
        </div>

        {/* Pie chart */}
        <div className="card">
          <h2 className="font-display font-600 text-base mb-4" style={{ color: 'var(--text-primary)' }}>By Status</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                </div>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent complaints */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-600 text-base" style={{ color: 'var(--text-primary)' }}>Recent Complaints</h2>
          <button onClick={() => navigate('/admin/issues')} className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1">View all <ArrowRight size={12} /></button>
        </div>
        {recentIssues.length === 0
          ? <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No complaints yet</p>
          : (
            <div className="space-y-1">
              {recentIssues.map(c => (
                <button
                  key={c._id}
                  onClick={() => navigate(`/admin/issues/${c._id}`)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-[var(--bg-secondary)] text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.title}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.user?.name} · {timeAgo(c.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                  </div>
                </button>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
