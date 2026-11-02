import React, { useState, useEffect } from 'react';
import { Radio, Calendar, Clock, Users, ArrowRight, Video, CheckCircle2, Sparkles } from 'lucide-react';
import api from '../../services/api';
import LiveClassRoom from '../../components/live/LiveClassRoom';

export default function LiveClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);

  const fetchLiveClasses = async () => {
    try {
      const res = await api.get('/live-classes');
      if (res.data.success) {
        setClasses(res.data.liveClasses);
      }
    } catch (err) {
      console.error('Error fetching live classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveClasses();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative z-10">
      {/* If in active session, render the full-screen WebRTC room */}
      {activeSession && (
        <LiveClassRoom
          liveClass={activeSession}
          onLeave={() => {
            setActiveSession(null);
            fetchLiveClasses();
          }}
        />
      )}

      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-slate-800 text-xs font-bold shadow-xs">
          <Radio className="w-4 h-4 text-slate-900 animate-pulse" />
          <span>Interactive WebRTC Classroom</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Live Classes & Office Hours</h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Attend live interactive lectures with synchronized video, live participant attendance, mic controls, and instant room chat.
        </p>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((lc) => (
          <div
            key={lc._id}
            className="p-6 rounded-3xl glass-card flex flex-col justify-between space-y-5 shadow-[0_15px_35px_rgba(15,23,42,0.06)]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-white/30 text-slate-800 border border-white/90 shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-ping"></span>
                  {lc.status.toUpperCase()}
                </span>
                <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {lc.durationMinutes || 60} mins
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 line-clamp-1">{lc.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {lc.description || 'Interactive live session with Q&A.'}
              </p>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-white/60 font-medium">
                <span>Instructor: {lc.instructor?.name || 'Prof. Vance'}</span>
                <span>Room: {lc.roomId}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveSession(lc)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl glass-btn-primary text-xs font-bold"
            >
              <Video className="w-4 h-4" />
              Join Live Classroom
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
