import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock, Award, ArrowRight, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { timeAgo } from '../../utils/helpers';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { authStatus } = useAuth();
  const [myComplaints, setMyComplaints] = useState([]);
  const [rankData, setRankData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, rRes] = await Promise.all([
          api.get('/api/user_issues/my-issues?limit=5'),
          api.get('/api/leaderboard/me').catch(() => ({ data: {} })),
        ]);
        setMyComplaints(Array.isArray(cRes.data?.data) ? cRes.data.data : []);
        setRankData(rRes.data?.data || null);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const counts = myComplaints.reduce((a, c) => {
    a[c.status] = (a[c.status] || 0) + 1;
    return a;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-700 text-2xl" style={{ color: 'var(--text-primary)' }}>
          Hello, {authStatus.userName?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Track your complaints and community issues</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Filed', value: myComplaints.length, icon: AlertCircle, color: 'bg-orange-500', path: '/home/my-complaints' },
          { label: 'Pending', value: counts['pending'] || 0, icon: Clock, color: 'bg-amber-500', path: '/home/my-complaints' },
          { label: 'Resolved', value: counts['resolved'] || 0, icon: CheckCircle, color: 'bg-green-500', path: '/home/my-complaints' },
          { label: 'My Rank', value: rankData?.rank ? `#${rankData.rank}` : '—', icon: Award, color: 'bg-violet-500', path: '/home/leaderboard' },
        ].map(s => (
          <motion.button key={s.label} whileHover={{ y: -2 }} onClick={() => navigate(s.path)} className="stat-card text-left">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${s.color}`}>
              <s.icon size={17} className="text-white" />
            </div>
            <p className="text-xl font-display font-700" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
          </motion.button>
        ))}
      </div>

      {/* CTA */}
      <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' }}>
        <div>
          <p className="font-display font-700 text-lg text-white">Have an issue to report?</p>
          <p className="text-sm text-orange-100 mt-0.5">File a complaint and track it in real-time</p>
        </div>
        <button onClick={() => navigate('/home/raise')} className="flex items-center gap-2 bg-white text-orange-600 font-medium text-sm px-4 py-2.5 rounded-xl hover:bg-orange-50 transition-colors">
          <PlusCircle size={16} /> Raise Issue
        </button>
      </div>

      {/* Recent complaints */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-600 text-base" style={{ color: 'var(--text-primary)' }}>My Recent Complaints</h2>
          <button onClick={() => navigate('/home/my-complaints')} className="text-xs text-orange-500 flex items-center gap-1">View all <ArrowRight size={12} /></button>
        </div>
        {loading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 rounded-xl shimmer" />)}</div>
        ) : myComplaints.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">📝</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No complaints filed yet</p>
            <button onClick={() => navigate('/home/raise')} className="btn-primary mt-3 text-sm">File First Complaint</button>
          </div>
        ) : myComplaints.map(c => (
          <div key={c._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.title}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(c.createdAt)}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <StatusBadge status={c.status} />
              <PriorityBadge priority={c.priority} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
