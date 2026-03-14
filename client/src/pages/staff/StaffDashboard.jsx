import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle, TrendingUp, ArrowRight, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { timeAgo, getInitials, avatarBg } from '../../utils/helpers';
import Loader from '../../components/common/Loader';

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <motion.div whileHover={{ y: -2 }} className="stat-card">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
      <Icon size={18} className="text-white" />
    </div>
    <p className="text-2xl font-display font-700" style={{ color: 'var(--text-primary)' }}>{value ?? '—'}</p>
    <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</p>
    {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
  </motion.div>
);

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { authStatus } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [rankData, setRankData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [cRes, sRes, rRes] = await Promise.all([
        api.get('/api/staff/issues?limit=8'),
        api.get('/api/staff/issues/stats').catch(() => ({ data: {} })),
        api.get('/api/leaderboard/me').catch(() => ({ data: {} })),
      ]);
      // Backend: { success, data: [...], count }
      setComplaints(Array.isArray(cRes.data?.data) ? cRes.data.data : []);
      // Backend stats: { success, data: { totalAssigned, byStatus: { pending, inProgress, resolved } } }
      const sData = sRes.data?.data || {};
      setStats({
        assigned:   sData.totalAssigned           || 0,
        pending:    sData.byStatus?.pending       || 0,
        inProgress: sData.byStatus?.inProgress    || 0,
        resolved:   sData.byStatus?.resolved      || 0,
      });
      setRankData(rRes.data?.data || null);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <Loader text="Loading…" />;

  const chartData = [
    { name: 'Assigned',    value: stats.assigned   || 0 },
    { name: 'In Progress', value: stats.inProgress || 0 },
    { name: 'Resolved',    value: stats.resolved   || 0 },
    { name: 'Pending',     value: stats.pending    || 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-700 text-2xl" style={{ color: 'var(--text-primary)' }}>
            Welcome, {authStatus.userName?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Here's your work summary</p>
        </div>
        <button onClick={load} className="btn-secondary"><RefreshCw size={14} /></button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Assigned" value={stats.assigned || 0} icon={AlertCircle} color="bg-orange-500" />
        <StatCard label="In Progress" value={stats.inProgress || 0} icon={Clock} color="bg-blue-500" />
        <StatCard label="Resolved" value={stats.resolved || 0} icon={CheckCircle} color="bg-green-500" />
        <StatCard label="My Rank" value={rankData?.rank ? `#${rankData.rank}` : '—'} icon={TrendingUp} color="bg-violet-500" sub={`${rankData?.points || 0} pts`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="card">
          <h2 className="font-display font-600 text-base mb-4" style={{ color: 'var(--text-primary)' }}>Issue Breakdown</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rank card */}
        {rankData && (
          <div className="card flex flex-col justify-between">
            <h2 className="font-display font-600 text-base mb-4" style={{ color: 'var(--text-primary)' }}>Leaderboard Standing</h2>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-display font-700 ${avatarBg(authStatus.userName)}`}>
                #{rankData.rank}
              </div>
              <div>
                <p className="font-display font-700 text-xl" style={{ color: 'var(--text-primary)' }}>{rankData.points} pts</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{rankData.complaintsResolved || stats.resolved || 0} resolved</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Avg. rating: {rankData.avgRating ? `${rankData.avgRating.toFixed(1)}★` : '—'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent issues */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-600 text-base" style={{ color: 'var(--text-primary)' }}>Recent Assignments</h2>
          <button onClick={() => navigate('/staff/issues')} className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1">View all <ArrowRight size={12} /></button>
        </div>
        <div className="space-y-1">
          {complaints.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No issues assigned yet</p>
          ) : complaints.map(c => (
            <button key={c._id} onClick={() => navigate('/staff/issues')}
              className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors text-left">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.title}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.user?.name} · {timeAgo(c.createdAt)}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <StatusBadge status={c.status} />
                <PriorityBadge priority={c.priority} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
