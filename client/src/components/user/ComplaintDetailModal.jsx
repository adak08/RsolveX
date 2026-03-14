import React, { useState, useEffect } from 'react';
import { MapPin, Clock, User, ThumbsUp, Star, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../common/Modal';
import { StatusBadge, PriorityBadge, CategoryBadge, AiBadge } from '../common/Badge';
import { formatDateTime, timeAgo, errMsg } from '../../utils/helpers';
import api from '../../api/axios';
import { useToast } from '../common/Toast';

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={24}
            className={`transition-colors ${n <= (hover || value) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ComplaintDetailModal({ complaint, onClose, showRating = false }) {
  const { toast } = useToast();
  const [voted, setVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(complaint?.voteCount || 0);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingDone, setRatingDone] = useState(!!complaint?.rating?.score);
  const [existingRating] = useState(complaint?.rating);

  const vote = async () => {
    if (voted) return;
    try {
      await api.put(`/api/user_issues/${complaint._id}/vote`);
      setVoteCount(v => v + 1);
      setVoted(true);
    } catch (e) { toast(errMsg(e), 'error'); }
  };

  const submitRating = async () => {
    if (!rating) return;
    setSubmittingRating(true);
    try {
      await api.post(`/api/ratings/${complaint._id}/rate`, {
        score: rating,
        comment: ratingComment,
      });
      setRatingDone(true);
      toast('Thank you for your rating!', 'success');
    } catch (e) { toast(errMsg(e), 'error'); }
    finally { setSubmittingRating(false); }
  };

  const canRate = showRating && complaint?.status === 'resolved' && !ratingDone;

  return (
    <Modal open onClose={onClose} size="lg" title={complaint?.title}>
      <div className="space-y-5">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <CategoryBadge category={complaint.category} />
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
          {complaint.aiClassification?.classified && (
            <AiBadge reasoning={complaint.aiClassification.reasoning} />
          )}
        </div>

        {/* Description */}
        <div className="p-4 rounded-xl text-sm leading-relaxed" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          {complaint.description}
        </div>

        {/* AI classification note */}
        {complaint.aiClassification?.classified && complaint.aiClassification.reasoning && (
          <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <p className="font-medium text-violet-600 mb-1">✦ AI Analysis</p>
            <p style={{ color: 'var(--text-secondary)' }}>{complaint.aiClassification.reasoning}</p>
          </div>
        )}

        {/* Images */}
        {complaint.images?.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {complaint.images.map((img, i) => (
              <img
                key={i} src={img} alt={`img-${i}`}
                className="w-full h-28 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(img)}
              />
            ))}
          </div>
        )}

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          {complaint.user?.name && (
            <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <User size={14} style={{ color: 'var(--text-muted)' }} />
              {complaint.user.name}
            </div>
          )}
          <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <Clock size={14} style={{ color: 'var(--text-muted)' }} />
            {formatDateTime(complaint.createdAt)}
          </div>
          {complaint.location?.address && (
            <div className="flex items-center gap-2 col-span-2" style={{ color: 'var(--text-secondary)' }}>
              <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
              {complaint.location.address}
            </div>
          )}
          {complaint.assignedTo?.name && (
            <div className="flex items-center gap-2 col-span-2" style={{ color: 'var(--text-secondary)' }}>
              <User size={14} style={{ color: 'var(--text-muted)' }} />
              Assigned to: <span className="font-medium">{complaint.assignedTo.name}</span>
            </div>
          )}
        </div>

        {/* Vote */}
        <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={vote}
            disabled={voted}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${voted ? 'text-orange-600 bg-orange-50 dark:bg-orange-950/30' : 'btn-secondary'}`}
          >
            <ThumbsUp size={15} className={voted ? 'fill-orange-500 text-orange-500' : ''} />
            {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
          </button>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {timeAgo(complaint.createdAt)}
          </span>
        </div>

        {/* Staff comments */}
        {complaint.comments?.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Updates from Staff</p>
            <div className="space-y-2">
              {complaint.comments.map((c, i) => (
                <div key={i} className="p-3 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <p style={{ color: 'var(--text-secondary)' }}>{c.message}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {c.staff?.name || 'Staff'} · {timeAgo(c.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing rating */}
        {ratingDone && existingRating?.score && (
          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Your Rating</p>
            <div className="flex items-center gap-2">
              {[1,2,3,4,5].map(n => (
                <Star key={n} size={18} className={n <= existingRating.score ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
              ))}
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{existingRating.score}/5</span>
            </div>
            {existingRating.comment && (
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>"{existingRating.comment}"</p>
            )}
          </div>
        )}

        {/* Rate resolved complaint */}
        <AnimatePresence>
          {canRate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl space-y-3"
              style={{ background: 'var(--accent-light)', border: '1px solid var(--border)' }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Rate this resolution</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Help us improve by rating how well this issue was handled
                </p>
              </div>
              <StarRating value={rating} onChange={setRating} />
              <textarea
                className="input resize-none text-sm"
                rows={2}
                placeholder="Optional comment…"
                value={ratingComment}
                onChange={e => setRatingComment(e.target.value)}
              />
              <button
                onClick={submitRating}
                disabled={!rating || submittingRating}
                className="btn-primary disabled:opacity-50"
              >
                {submittingRating ? 'Submitting…' : 'Submit Rating'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
