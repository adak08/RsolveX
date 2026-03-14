import React, { useState } from 'react';
import { Users, CheckCircle } from 'lucide-react';
import Modal from '../common/Modal';
import api from '../../api/axios';
import { errMsg } from '../../utils/helpers';
import { useToast } from '../common/Toast';

export default function BulkAssignModal({ selectedIds, staffList, onClose, onSuccess }) {
  const { toast } = useToast();
  const [staffId, setStaffId] = useState('');
  const [loading, setLoading] = useState(false);

  const assign = async () => {
    if (!staffId) return;
    setLoading(true);
    try {
      await api.post('/api/admin/issues/bulk-assign', { complaintIds: selectedIds, assignedTo: staffId });
      toast(`${selectedIds.length} complaints assigned successfully`, 'success');
      onSuccess();
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Bulk Assign Complaints" size="sm"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={assign} disabled={!staffId || loading} className="btn-primary disabled:opacity-50">
            {loading ? 'Assigning…' : `Assign ${selectedIds.length} complaints`}
          </button>
        </>
      }
    >
      <div className="space-y-4 py-2">
        <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Users size={16} className="text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{selectedIds.length} complaints selected</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>All will be assigned to the selected staff member</p>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>Select Staff Member</label>
          <select className="input" value={staffId} onChange={e => setStaffId(e.target.value)}>
            <option value="">Choose staff…</option>
            {staffList.map(s => (
              <option key={s._id} value={s._id}>{s.name} — {s.staffId}</option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}
