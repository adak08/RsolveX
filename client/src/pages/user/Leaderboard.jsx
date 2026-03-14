import React, { useState, useEffect } from 'react';
import { Trophy, Award, Star, RefreshCw, TrendingUp } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { getInitials, avatarBg } from '../../utils/helpers';
import Loader from '../../components/common/Loader';

export default function Leaderboard() {
  const { authStatus } = useAuth();
  const [board, setBoard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [bRes, mRes] = await Promise.all([
        api.get('/api/leaderboard'),
        api.get('/api/leaderboard/me').catch(() => ({ data: {} })),
      ]);
      // Backend: { success, data: [...], pagination }
      setBoard(Array.isArray(bRes.data?.data) ? bRes.data.data : []);
      setMyRank(mRes.data?.data || null);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-700 text-2xl" style={{ color: 'var(--text-primary)' }}>Leaderboard</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Top contributors in your workspace</p>
        </div>
        <button onClick={load} className="btn-secondary"><RefreshCw size={14} /></button>
      </div>

      {/* My rank card */}
      {myRank && (
        <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #ea580c 0%, #9a3412 100%)' }}>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <span className="font-display font-700 text-2xl text-white">#{myRank.rank}</span>
          </div>
          <div className="flex-1 text-white">
            <p className="font-display font-700 text-lg">Your Standing</p>
            <p className="text-orange-100 text-sm">{myRank.points} points · {myRank.complaintsSubmitted} complaints filed</p>
          </div>
          {myRank.avgRating > 0 && (
            <div className="text-white text-center">
              <p className="font-display font-700 text-xl">{myRank.avgRating?.toFixed(1)}</p>
              <p className="text-xs text-orange-100">avg rating</p>
            </div>
          )}
        </div>
      )}

      {/* Podium */}
      {!loading && board.length >= 3 && (
        <div className="flex items-end justify-center gap-3 pb-4">
          {[board[1], board[0], board[2]].map((entry, i) => {
            const positions = [1, 0, 2];
            const heights = ['h-20', 'h-28', 'h-16'];
            const rank = positions[i] + 1;
            if (!entry) return null;
            const user = entry.userId;
            return (
              <div key={entry._id} className="flex flex-col items-center gap-2 flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${avatarBg(user?.name)}`}>
                  {getInitials(user?.name)}
                </div>
                <p className="text-xs font-medium text-center" style={{ color: 'var(--text-primary)' }}>{user?.name?.split(' ')[0]}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{entry.points} pts</p>
                <div className={`w-full ${heights[i]} rounded-t-xl flex items-center justify-center text-2xl`}
                  style={{ background: i === 1 ? '#f97316' : i === 0 ? '#c2410c' : '#7c3aed', opacity: i === 1 ? 1 : 0.7 }}>
                  {medals[rank - 1]}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      {loading ? <Loader /> : (
        <div className="card p-0 overflow-hidden">
          {board.map((entry, i) => {
            const user = entry.userId;
            const isMe = user?._id === authStatus.userData?._id;
            return (
              <div key={entry._id}
                className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${isMe ? 'bg-orange-50 dark:bg-orange-950/20' : 'hover:bg-[var(--bg-secondary)]'}`}
                style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="w-7 text-center font-display font-700 text-base" style={{ color: i < 3 ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {i < 3 ? medals[i] : i + 1}
                </div>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${avatarBg(user?.name)}`}>
                  {getInitials(user?.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {user?.name} {isMe && <span className="text-xs text-orange-500 font-normal">(you)</span>}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{entry.complaintsSubmitted} complaints · {entry.votesGiven} votes</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display font-700 text-base" style={{ color: 'var(--accent)' }}>{entry.points}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>pts</p>
                </div>
              </div>
            );
          })}
          {board.length === 0 && (
            <div className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>
              <Trophy size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No leaderboard data yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
