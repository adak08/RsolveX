import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import AuditTimeline from '../../components/audit/AuditTimeline';
import AuditFilters from '../../components/audit/AuditFilters';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [action, setAction] = useState('');
  const [actor, setActor] = useState('');
  const LIMIT = 50;

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (action) params.action = action;
      if (actor) params.actorModel = actor;
      const res = await api.get('/api/audit', { params });
      setLogs(res.data?.data || []);
      setTotal(res.data?.pagination?.total || 0);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, action, actor]);

  return (
    <div className="space-y-2 animate-fade-in pb-10">
      
      {/* Top Filters & Header */}
      <AuditFilters 
        action={action} 
        setAction={(val) => { setAction(val); setPage(1); }} 
        actor={actor} 
        setActor={(val) => { setActor(val); setPage(1); }} 
        onRefresh={load}
        total={total}
      />

      {/* Main Content Area */}
      {loading ? (
        <Loader /> 
      ) : (
        <AuditTimeline logs={logs} />
      )}

      {/* Pagination */}
      {!loading && Math.ceil(total / LIMIT) > 1 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Page {page} of {Math.ceil(total / LIMIT)}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1} 
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => p + 1)} 
              disabled={page >= Math.ceil(total / LIMIT)} 
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
