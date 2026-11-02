import React from 'react';
import { Server, Database, Video, Radio, Cpu, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

export default function SystemSettingsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative z-10">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-900 text-xs font-bold shadow-xs mb-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Core Infrastructure Matrix</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Infrastructure & Settings</h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Review core decoupled architecture, streaming gateways, background queues, and AI proctoring engines.
        </p>
      </div>

      {/* Decoupled Architecture Matrix in High-Graphics Glass */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl glass-card space-y-3 shadow-[0_15px_35px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">1. Primary Store</span>
            <div className="p-2.5 rounded-2xl bg-white/40 border border-white/70 text-slate-900 shadow-xs backdrop-blur-md">
              <Database className="w-5 h-5 text-slate-900" />
            </div>
          </div>
          <p className="text-base font-bold text-slate-900">MongoDB Core</p>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            Stores users, courses, lessons, exam results, timestamps, and proctoring audit logs.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 pt-1">
            <CheckCircle2 className="w-4 h-4" /> Connected
          </span>
        </div>

        <div className="p-6 rounded-3xl glass-card space-y-3 shadow-[0_15px_35px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">2. Video Storage</span>
            <div className="p-2.5 rounded-2xl bg-white/40 border border-white/70 text-slate-900 shadow-xs backdrop-blur-md">
              <Video className="w-5 h-5 text-slate-900" />
            </div>
          </div>
          <p className="text-base font-bold text-slate-900">Cloudinary / HTTP 206 Stream</p>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            Stores large media files separately from MongoDB. Streams with HTTP byte ranges.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 pt-1">
            <CheckCircle2 className="w-4 h-4" /> Streaming Active
          </span>
        </div>

        <div className="p-6 rounded-3xl glass-card space-y-3 shadow-[0_15px_35px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">3. Job Queues</span>
            <div className="p-2.5 rounded-2xl bg-white/40 border border-white/70 text-slate-900 shadow-xs backdrop-blur-md">
              <Cpu className="w-5 h-5 text-slate-900" />
            </div>
          </div>
          <p className="text-base font-bold text-slate-900">Redis + BullMQ</p>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            Asynchronous background workers for video processing, notifications, and job queues.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 pt-1">
            <CheckCircle2 className="w-4 h-4" /> Worker Online
          </span>
        </div>

        <div className="p-6 rounded-3xl glass-card space-y-3 shadow-[0_15px_35px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">4. AI Proctor</span>
            <div className="p-2.5 rounded-2xl bg-white/40 border border-white/70 text-slate-900 shadow-xs backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-slate-900" />
            </div>
          </div>
          <p className="text-base font-bold text-slate-900">FaceAPI.js Engine</p>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            Client-side face detection, multi-face alerts, head tilt, and tab visibility monitoring.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 pt-1">
            <CheckCircle2 className="w-4 h-4" /> Model Ready
          </span>
        </div>
      </div>

      {/* Platform Parameters Form in Glass Panel */}
      <div className="p-8 rounded-3xl glass-panel space-y-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
        <h2 className="text-base font-black text-slate-900">Global Proctoring Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-600 mb-2">
              Face Detection Frequency
            </label>
            <input
              type="text"
              readOnly
              value="Every 1,500 ms (Real-time Video Sampling)"
              className="w-full p-3.5 glass-input rounded-2xl text-slate-900 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-600 mb-2">
              Multi-Face Threshold
            </label>
            <input
              type="text"
              readOnly
              value="Flag if > 1 faces detected for > 2 consecutive cycles"
              className="w-full p-3.5 glass-input rounded-2xl text-slate-900 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-600 mb-2">
              Tab / Window Blur Trigger
            </label>
            <input
              type="text"
              readOnly
              value="Immediate critical alert logged on window.onblur / visibilitychange"
              className="w-full p-3.5 glass-input rounded-2xl text-slate-900 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-600 mb-2">
              Certificate Engine
            </label>
            <input
              type="text"
              readOnly
              value="Disabled (Per Specification: Strict No-Certificate Policy)"
              className="w-full p-3.5 glass-input rounded-2xl text-slate-500 font-mono text-xs"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/60 flex justify-end">
          <button
            type="button"
            className="px-6 py-3 rounded-2xl glass-btn-primary font-bold text-xs"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
