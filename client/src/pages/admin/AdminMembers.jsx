import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCw, Users, UserCog, Trash2, ToggleLeft, ToggleRight, ChevronRight, Loader2 } from 'lucide-react';
import { adminService, workspaceService } from '../../services';
import { formatDate, capitalize } from '../../utils/helpers';
import { Avatar, EmptyState, Skeleton, ConfirmModal } from '../../components/common/UI';

// ─── Admin Users Page ─────────────────────────────────────────────────────────
export const AdminUsersPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [removeTarget, setRemoveTarget] = useState(null);

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await workspaceService.getMembers();
      const data = res.data?.data || {};
      setMembers([
        ...(data.users || []).map(u => ({ ...u, _type: 'user' })),
      ]);
    } catch { } finally { setLoading(false); }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    try {
      await workspaceService.removeMember('user', removeTarget._id);
      setMembers(prev => prev.filter(m => m._id !== removeTarget._id));
      setRemoveTarget(null);
    } catch { }
  };

  const filtered = members.filter(m =>
    !search || m.name?.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Users</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{members.length} registered users</p>
        </div>
        <button onClick={fetchMembers} className="btn-secondary py-2 px-3"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        <input className="input pl-9 py-2 text-sm" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="grid grid-cols-4 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide border-b" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>
          <span className="col-span-2">User</span>
          <span className="hidden md:block">Joined</span>
          <span>Actions</span>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No users found" description="Users who join your workspace will appear here" />
        ) : filtered.map(user => (
          <div key={user._id} className="grid grid-cols-4 px-4 py-3 items-center border-b hover:opacity-90 transition-all" style={{ borderColor: 'var(--border)' }}>
            <div className="col-span-2 flex items-center gap-3 min-w-0">
              <Avatar name={user.name} image={user.profileImage} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
              </div>
            </div>
            <div className="hidden md:block text-sm" style={{ color: 'var(--text-secondary)' }}>{formatDate(user.createdAt)}</div>
            <div>
              <button onClick={() => setRemoveTarget(user)} className="btn-ghost text-red-500 py-1.5 px-2 text-xs hover:bg-red-50 dark:hover:bg-red-900/10">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {removeTarget && (
        <ConfirmModal
          title="Remove User"
          message={`Remove ${removeTarget.name} from this workspace?`}
          onConfirm={handleRemove}
          onCancel={() => setRemoveTarget(null)}
          confirmLabel="Remove"
          danger
        />
      )}
    </div>
  );
};

// ─── Admin Staff Page ─────────────────────────────────────────────────────────
export const AdminStaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [removeTarget, setRemoveTarget] = useState(null);

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await workspaceService.getMembers();
      const data = res.data?.data || {};
      setStaff((data.staff || []).map(s => ({ ...s, _type: 'staff' })));
    } catch { } finally { setLoading(false); }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    try {
      await workspaceService.removeMember('staff', removeTarget._id);
      setStaff(prev => prev.filter(s => s._id !== removeTarget._id));
      setRemoveTarget(null);
    } catch { }
  };

  const filtered = staff.filter(s =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()) || s.staffId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Staff</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{staff.length} staff members</p>
        </div>
        <button onClick={fetchStaff} className="btn-secondary py-2 px-3"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        <input className="input pl-9 py-2 text-sm" placeholder="Search staff…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="grid grid-cols-5 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide border-b" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>
          <span className="col-span-2">Staff Member</span>
          <span className="hidden md:block">Staff ID</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={UserCog} title="No staff members" description="Staff who join your workspace will appear here" />
        ) : filtered.map(s => (
          <div key={s._id} className="grid grid-cols-5 px-4 py-3 items-center border-b hover:opacity-90 transition-all" style={{ borderColor: 'var(--border)' }}>
            <div className="col-span-2 flex items-center gap-3 min-w-0">
              <Avatar name={s.name} image={s.profileImage} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{s.name}</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{s.email}</p>
              </div>
            </div>
            <div className="hidden md:block font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{s.staffId}</div>
            <div>
              <span className={`badge ${s.isActive ? 'badge-resolved' : 'badge-rejected'}`}>
                {s.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <button onClick={() => setRemoveTarget(s)} className="btn-ghost text-red-500 py-1.5 px-2 text-xs hover:bg-red-50 dark:hover:bg-red-900/10">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {removeTarget && (
        <ConfirmModal
          title="Remove Staff"
          message={`Remove ${removeTarget.name} from this workspace?`}
          onConfirm={handleRemove}
          onCancel={() => setRemoveTarget(null)}
          confirmLabel="Remove"
          danger
        />
      )}
    </div>
  );
};
