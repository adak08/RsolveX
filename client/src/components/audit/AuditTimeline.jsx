import React from 'react';
import AuditDateGroup from './AuditDateGroup';
import AuditEmptyState from './AuditEmptyState';

// Helper to group logs by date (Today, Yesterday, Specific Date)
const groupLogsByDate = (logs) => {
  const groups = {};
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  logs.forEach(log => {
    const logDate = new Date(log.createdAt);
    logDate.setHours(0, 0, 0, 0);
    
    let label = '';
    if (logDate.getTime() === today.getTime()) {
      label = 'Today';
    } else if (logDate.getTime() === yesterday.getTime()) {
      label = 'Yesterday';
    } else {
      label = logDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }

    if (!groups[label]) groups[label] = [];
    groups[label].push(log);
  });

  return groups;
};

export default function AuditTimeline({ logs = [] }) {
  if (!logs || logs.length === 0) {
    return <AuditEmptyState />;
  }

  const groupedLogs = groupLogsByDate(logs);

  return (
    <div className="relative w-full max-w-4xl mx-auto py-4">
      {Object.entries(groupedLogs).map(([dateLabel, dayLogs]) => (
        <AuditDateGroup 
          key={dateLabel} 
          dateLabel={dateLabel} 
          logs={dayLogs} 
        />
      ))}
    </div>
  );
}
