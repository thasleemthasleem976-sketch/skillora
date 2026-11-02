import React, { useState } from 'react';
import { User, Mail, Shield, Save, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { triggerToastAlert } = useNotifications();

  const [name, setName] = useState(user?.name || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', {
        name,
        headline,
        bio,
        avatar,
      });
      if (res.data.success) {
        setUser(res.data.user);
        triggerToastAlert('Profile updated successfully!', 'info');
      }
    } catch (err) {
      triggerToastAlert('Failed to update profile', 'warning');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 relative z-10">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-slate-800 text-xs font-bold shadow-xs mb-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>User Identity Settings</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings & Profile</h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage your account credentials, avatar icon, and public EdTech bio.
        </p>
      </div>

      <div className="p-8 rounded-3xl glass-panel space-y-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] border border-white/80">
        <div className="flex items-center gap-5 pb-6 border-b border-white/60">
          <img
            src={avatar || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
            alt={name}
            className="w-20 h-20 rounded-3xl object-cover border-2 border-white/90 shadow-md"
          />
          <div>
            <h2 className="text-xl font-black text-slate-900">{name}</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
            <span
              className={`inline-block text-[10px] font-black uppercase px-3 py-1 rounded-xl mt-2.5 shadow-xs ${
                user?.role === 'admin'
                  ? 'bg-slate-900 text-white'
                  : user?.role === 'teacher'
                  ? 'bg-white/40 text-slate-900 border border-white'
                  : 'bg-white/70 text-slate-700 border border-white/80'
              }`}
            >
              Role: {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 glass-input rounded-2xl text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                Professional Headline
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Software Engineer / Computer Science Student"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full p-3 glass-input rounded-2xl text-slate-900 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
              Custom Avatar Image URL
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full p-3 glass-input rounded-2xl text-slate-900 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
              Biographical Statement
            </label>
            <textarea
              rows="4"
              placeholder="Tell others about your learning goals or teaching background..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 glass-input rounded-2xl text-slate-900 text-xs"
            />
          </div>

          <div className="pt-4 border-t border-white/60 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-7 py-3 rounded-2xl glass-btn-primary font-bold text-xs flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
