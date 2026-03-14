import React from 'react';

export default function Loader({ text = 'Loading…', fullScreen = false }) {
  const inner = (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-orange-100 dark:border-orange-900" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-500 animate-spin" />
      </div>
      {text && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{text}</p>}
    </div>
  );
  if (fullScreen) return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'var(--bg-primary)' }}>
      {inner}
    </div>
  );
  return <div className="flex items-center justify-center py-16">{inner}</div>;
}

export function SkeletonCard() {
  return (
    <div className="card space-y-3 animate-pulse">
      <div className="h-4 rounded-lg w-3/4 shimmer" />
      <div className="h-3 rounded-lg w-full shimmer" />
      <div className="h-3 rounded-lg w-5/6 shimmer" />
      <div className="flex gap-2 pt-2">
        <div className="h-6 w-16 rounded-lg shimmer" />
        <div className="h-6 w-20 rounded-lg shimmer" />
      </div>
    </div>
  );
}
