import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatAuditEvent, COLOR_MAP } from '../../utils/auditEventFormatter';
import { timeAgo, formatDateTime } from '../../utils/helpers';

export default function AuditEventCard({ log, isLast }) {
  const [expanded, setExpanded] = useState(false);
  const event = formatAuditEvent(log);
  const colors = COLOR_MAP[event.color] || COLOR_MAP.gray;
  const Icon = event.icon;

  const hasDetails = event.details && Object.keys(event.details).length > 0 && 
    !(Object.keys(event.details).length === 1 && event.details.updates); // Skip if only updates exist, as they're in description

  const actorName = log.actorName || log.actorModel || 'System';

  return (
    <div className="relative pl-8 pb-8 group">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-gray-200 dark:bg-gray-800 group-hover:bg-gray-300 dark:group-hover:bg-gray-700 transition-colors" />
      )}

      {/* Timeline Dot/Icon */}
      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-[var(--bg-primary)] shadow-sm ${colors.bg} ${colors.text} z-10 transition-transform group-hover:scale-110`}>
        <Icon size={12} strokeWidth={2.5} />
      </div>

      {/* Card Content */}
      <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all overflow-hidden">
        
        {/* Header */}
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">{event.title}</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{event.description}</p>
          </div>
          
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-1 text-xs text-gray-500 shrink-0">
            <span className="font-medium bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">By {actorName}</span>
            <span title={formatDateTime(log.createdAt)}>{timeAgo(log.createdAt)}</span>
          </div>
        </div>

        {/* Details Toggle */}
        {hasDetails && (
          <div className="border-t border-gray-50 dark:border-gray-800/50">
            <button 
              onClick={() => setExpanded(!expanded)}
              className="w-full px-4 py-2 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {expanded ? (
                <><ChevronUp size={14} /> Hide Details</>
              ) : (
                <><ChevronDown size={14} /> Show Details</>
              )}
            </button>
            
            {/* Expanded Content */}
            {expanded && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(event.details).map(([key, value]) => {
                    if (!value || typeof value === 'object') return null;
                    return (
                      <div key={key} className="flex flex-col">
                        <span className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-0.5">
                          {key}
                        </span>
                        <span className="text-gray-900 dark:text-gray-200 font-medium break-words">
                          {String(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
