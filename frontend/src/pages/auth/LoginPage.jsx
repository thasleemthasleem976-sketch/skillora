import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ShieldCheck, Lock, Mail, ArrowRight, UserCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LiquidBackground from '../../components/common/LiquidBackground';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (roleEmail) => {
    setError('');
    setLoading(true);
    try {
      const user = await login(roleEmail, 'Password@123');
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 select-none overflow-hidden">
      {/* Liquid Mesh Background with morphing fluid bubbles */}
      <LiquidBackground />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-14 h-14 rounded-3xl bg-black mx-auto flex items-center justify-center shadow-[0_12px_30px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.4)]">
          <BookOpen className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
          Sign in to <span className="text-black">Skillora</span>
        </h2>
        <p className="text-xs text-gray-600 font-medium">
          Advanced EdTech LMS with Automated Exam Proctoring & Video Streaming
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.95)] space-y-6">
          {/* Sample Login Entries Capsule */}
          <div className="p-4 rounded-2xl bg-white/85 backdrop-blur-md border border-white/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-800">
                <Sparkles className="w-4 h-4 text-black" />
                <span>Sample Login Entries</span>
              </div>
              <span className="text-[10px] text-gray-500 font-mono">Password: Password@123</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('student@skillora.edu');
                  setPassword('Password@123');
                  handleQuickDemo('student@skillora.edu');
                }}
                className="py-2.5 px-2 bg-white/40 hover:bg-white text-gray-800 border border-white/95 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xs"
              >
                <div className="text-[11px] font-black text-gray-900">Student</div>
                <div className="text-[9px] text-gray-500 font-mono truncate">student@skillora.edu</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('teacher@skillora.edu');
                  setPassword('Password@123');
                  handleQuickDemo('teacher@skillora.edu');
                }}
                className="py-2.5 px-2 bg-white/40 hover:bg-white text-gray-800 border border-white/95 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xs"
              >
                <div className="text-[11px] font-black text-gray-900">Teacher</div>
                <div className="text-[9px] text-gray-500 font-mono truncate">teacher@skillora.edu</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@skillora.edu');
                  setPassword('Password@123');
                  handleQuickDemo('admin@skillora.edu');
                }}
                className="py-2.5 px-2 bg-slate-900 hover:bg-black text-white rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xs"
              >
                <div className="text-[11px] font-black text-white">Admin</div>
                <div className="text-[9px] text-slate-300 font-mono truncate">admin@skillora.edu</div>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-300 text-red-900 text-xs font-semibold backdrop-blur-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="e.g. student@skillora.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-black/50 shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-black/50 shadow-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl glass-btn-primary text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                'Signing In...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-gray-200/50 text-center">
            <p className="text-xs text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-black hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
