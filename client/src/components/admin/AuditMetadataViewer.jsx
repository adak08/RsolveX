import React from 'react';

const formatLabel = (key) => {
  // Convert camelCase to Title Case (e.g., 'oldStatus' -> 'Old Status')
  const result = key.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};

const isObject = (val) => {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
};

export default function AuditMetadataViewer({ metadata }) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return <p className="text-xs text-gray-500 italic">No additional details</p>;
  }

  const renderValue = (val) => {
    if (val === null || val === undefined) {
      return <span className="text-gray-400 italic">N/A</span>;
    }
    if (typeof val === 'boolean') {
      return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${val ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
          {val ? 'True' : 'False'}
        </span>
      );
    }
    if (Array.isArray(val)) {
      if (val.length === 0) return <span className="text-gray-400 italic">Empty List</span>;
      
      // Special case for our formatted metadata [{key, label, value}]
      if (val.every(item => item && typeof item === 'object' && 'key' in item && 'label' in item && 'value' in item)) {
        return (
          <div className="space-y-2 mt-1">
            {val.map((item, i) => (
              <div key={item.key || i} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 p-2 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                <span className="text-xs uppercase tracking-wider font-semibold min-w-[120px]" style={{ color: 'var(--text-muted)' }}>
                  {item.label}
                </span>
                <div className="flex-1 overflow-hidden break-words text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {item.value || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        );
      }

      return (
        <ul className="list-disc list-inside space-y-1">
          {val.map((item, i) => (
            <li key={i}>{isObject(item) ? renderObject(item) : renderValue(item)}</li>
          ))}
        </ul>
      );
    }
    if (isObject(val)) {
      return renderObject(val);
    }
    
    // For strings and numbers
    return <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{String(val)}</span>;
  };

  const renderObject = (obj) => {
    return (
      <div className="space-y-2 mt-1">
        {Object.entries(obj).map(([k, v]) => (
          <div key={k} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 p-2 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
            <span className="text-xs uppercase tracking-wider font-semibold min-w-[120px]" style={{ color: 'var(--text-muted)' }}>
              {formatLabel(k)}
            </span>
            <div className="flex-1 overflow-hidden break-words">
              {renderValue(v)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="text-sm">
      {renderObject(metadata)}
    </div>
  );
}
