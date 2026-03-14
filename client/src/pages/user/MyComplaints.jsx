import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import api from '../../api/axios';
import ComplaintCard from '../../components/common/ComplaintCard';
import Loader, { SkeletonCard } from '../../components/common/Loader';
import ComplaintDetailModal from '../../components/user/ComplaintDetailModal';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/user_issues/my-issues');
      // Backend: { success, count, data: [...] }
      setComplaints(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-700 text-2xl" style={{ color: 'var(--text-primary)' }}>My Complaints</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{complaints.length} filed by you</p>
        </div>
        <button onClick={load} className="btn-secondary"><RefreshCw size={14} /></button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : complaints.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-2">📝</p>
          <p className="font-display font-600 mb-1" style={{ color: 'var(--text-primary)' }}>No complaints yet</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>File your first complaint using the Raise Issue page</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map(c => <ComplaintCard key={c._id} complaint={c} onClick={setSelected} />)}
        </div>
      )}

      {selected && <ComplaintDetailModal complaint={selected} onClose={() => { setSelected(null); load(); }} showRating />}
    </div>
  );
}
