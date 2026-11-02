import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LiquidBackground from '../../components/common/LiquidBackground';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    headline: '',
    bio: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await register(formData);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          Join <span className="text-black">Skillora</span>
        </h2>
        <p className="text-xs text-gray-600 font-medium">
          Create your account to start learning or teaching
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.95)] space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-300 text-red-900 text-xs font-semibold backdrop-blur-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-black/50 shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="e.g. alex@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-black/50 shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'student' })}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center ${
                    formData.role === 'student'
                      ? 'bg-black text-white border-black shadow-[0_4px_14px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.3)]'
                      : 'bg-white/70 text-gray-700 border-white/80 hover:bg-white'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'teacher' })}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center ${
                    formData.role === 'teacher'
                      ? 'bg-black text-white border-black shadow-[0_4px_14px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.3)]'
                      : 'bg-white/70 text-gray-700 border-white/80 hover:bg-white'
                  }`}
                >
                  Teacher
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl glass-btn-primary text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                'Creating Account...'
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-gray-200/50 text-center">
            <p className="text-xs text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-black hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
