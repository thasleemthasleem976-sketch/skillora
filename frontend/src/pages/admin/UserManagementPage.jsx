import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, Trash2, UserX, UserCheck, Shield, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { triggerToastAlert } = useNotifications();

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users', {
        params: {
          role: roleFilter !== 'all' ? roleFilter : undefined,
          search: search || undefined,
        },
      });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, search]);

  const handleUpdateUser = async (userId, updateData) => {
    try {
      const res = await api.put(`/admin/users/${userId}`, updateData);
      if (res.data.success) {
        triggerToastAlert('User status updated successfully', 'info');
        fetchUsers();
      }
    } catch (err) {
      triggerToastAlert('Failed to update user', 'warning');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        triggerToastAlert('User deleted', 'info');
        fetchUsers();
      }
    } catch (err) {
      triggerToastAlert(err.response?.data?.message || 'Failed to delete user', 'warning');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative z-10">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-slate-800 text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Identity & Access Governance</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Access Management</h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Manage enrolled students, faculty permissions, role switches, and active account standings.
        </p>
      </div>

      {/* Filters & Search in Glass Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3 rounded-3xl glass-panel shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-2">
          {['all', 'student', 'teacher', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${
                roleFilter === r
                  ? 'glass-btn-primary shadow-xs'
                  : 'bg-white/60 text-slate-700 hover:text-slate-900 hover:bg-white/40 border border-white/80'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900/50 shadow-xs"
          />
        </div>
      </div>

      {/* Users Table in Master Glass Panel */}
      <div className="glass-panel overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.06)] border border-white/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/60 bg-white/40 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Joined Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-white/50 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                        alt={u.name}
                        className="w-8 h-8 rounded-xl border border-white/80 object-cover shadow-xs"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-slate-500 font-mono text-[11px]">{u.email}</p>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : u.role === 'teacher'
                            ? 'bg-white/30 text-slate-900 border border-white/90'
                            : 'bg-white/60 text-slate-700 border border-white/70'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold ${
                          u.isActive
                            ? 'bg-emerald-500/10 text-emerald-800 border border-emerald-500/20'
                            : 'bg-slate-200 text-slate-500 line-through'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}
                        ></span>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-500 font-mono">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleUpdateUser(u._id, { isActive: !u.isActive })}
                        className="p-2 rounded-xl bg-white/70 hover:bg-white text-slate-700 transition-all border border-white/80 shadow-xs"
                        title={u.isActive ? 'Suspend User' : 'Activate User'}
                      >
                        {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>

                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateUser(u._id, { role: e.target.value })}
                        className="bg-white/30 border border-white/90 rounded-xl px-2.5 py-1 text-[11px] font-bold text-slate-700 focus:outline-none shadow-xs"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>

                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="p-2 rounded-xl bg-red-50/80 hover:bg-red-100 text-red-600 transition-all border border-red-200/80 shadow-xs"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
