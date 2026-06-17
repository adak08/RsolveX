import React from 'react';
import AuditEventCard from './AuditEventCard';

export default function AuditDateGroup({ dateLabel, logs }) {
  return (
    <div className="mb-6 relative">
      {/* Date Sticky Header */}
      <div className="sticky top-0 z-20 py-2 mb-4 bg-gradient-to-b from-white via-white to-transparent dark:from-[var(--bg-primary)] dark:via-[var(--bg-primary)] dark:to-transparent">
        <div className="inline-flex items-center">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 shadow-sm">
            {dateLabel}
          </span>
        </div>
      </div>

      {/* Events */}
      <div className="ml-2 sm:ml-4">
        {logs.map((log, index) => (
          <AuditEventCard 
            key={log._id} 
            log={log} 
            isLast={index === logs.length - 1} 
          />
        ))}
      </div>
    </div>
  );
}
