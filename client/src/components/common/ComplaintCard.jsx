import React from 'react';
import { MapPin, ThumbsUp, MessageSquare, Eye, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { StatusBadge, PriorityBadge, CategoryBadge, AiBadge } from './Badge';
import { timeAgo, truncate, getInitials, avatarBg } from '../../utils/helpers';

export default function ComplaintCard({ complaint, onClick, showActions, onVote }) {
  const { title, description, category, status, priority, priorityMode, voteCount, location, user, createdAt, aiClassification, images } = complaint;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-hover cursor-pointer group"
      onClick={() => onClick?.(complaint)}
    >
      {images?.[0] && (
        <div className="h-36 -mx-6 -mt-6 mb-4 rounded-t-2xl overflow-hidden relative">
          <img src={images[0]} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge category={category} />
          <StatusBadge status={status} />
          <PriorityBadge priority={priority} />
          {aiClassification?.classified && <AiBadge reasoning={aiClassification.reasoning} />}
        </div>
        <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{timeAgo(createdAt)}</span>
      </div>

      <h3 className="font-display font-600 text-base leading-snug mb-1.5" style={{ color: 'var(--text-primary)' }}>
        {truncate(title, 70)}
      </h3>
      <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
        {truncate(description, 100)}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {location?.address && (
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              <MapPin size={12} /> {truncate(location.address, 30)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {onVote && (
            <button
              onClick={(e) => { e.stopPropagation(); onVote(complaint._id); }}
              className="flex items-center gap-1 text-xs transition-colors hover:text-orange-500"
              style={{ color: 'var(--text-muted)' }}
            >
              <ThumbsUp size={13} /> {voteCount || 0}
            </button>
          )}
          {user && (
            <div className="flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${avatarBg(user.name)}`}>
                {getInitials(user.name)}
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.name?.split(' ')[0]}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
