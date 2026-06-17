import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';

export default function AuditFilters({ 
  action, 
  setAction, 
  actor, 
  setActor,
  onRefresh,
  total
}) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Activity Timeline
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {total} recorded events in your workspace
          </p>
        </div>
        <button 
          onClick={onRefresh} 
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="p-1 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl inline-flex flex-wrap items-center gap-2 w-full sm:w-auto border border-gray-200 dark:border-gray-700">
        
        <div className="relative flex-1 sm:flex-none">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select 
            className="w-full sm:w-auto appearance-none bg-transparent pl-9 pr-8 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
            value={action} 
            onChange={e => setAction(e.target.value)}
          >
            <option value="">All Events</option>
            <option value="complaint.created">Complaint Created</option>
            <option value="complaint.assigned">Assigned</option>
            <option value="complaint.status_changed">Status Changed</option>
            <option value="complaint.updated">Updated</option>
            <option value="complaint.commented">Comment Added</option>
            <option value="complaint.resolved">Resolved</option>
            <option value="complaint.rejected">Rejected</option>
            <option value="staff.registered">Staff Joined</option>
          </select>
        </div>

        <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600" />

        <div className="relative flex-1 sm:flex-none">
          <select 
            className="w-full sm:w-auto appearance-none bg-transparent px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
            value={actor} 
            onChange={e => setActor(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="User">User</option>
            <option value="Staff">Staff</option>
            <option value="Admin">Admin</option>
            <option value="System">System</option>
          </select>
        </div>
      </div>
    </div>
  );
}
