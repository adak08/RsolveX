import React from 'react';
import { Activity } from 'lucide-react';

export default function AuditEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mt-4">
      <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-100 dark:border-gray-700">
        <Activity size={28} className="text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Activity Found</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
        We couldn't find any events matching your current filters. Try adjusting your search criteria or check back later.
      </p>
    </div>
  );
}
