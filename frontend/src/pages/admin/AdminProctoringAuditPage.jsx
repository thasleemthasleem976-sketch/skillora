import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Filter, Search, User, Sparkles } from 'lucide-react';
import api from '../../services/api';

export default function AdminProctoringAuditPage() {
  const [logs, setLogs] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/proctoring/all');
        if (res.data.success) {
          setLogs(res.data.logs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (severityFilter === 'all') return true;
    return log.severity === severityFilter;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative z-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-slate-800 text-xs font-bold shadow-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>AI Telemetry Audit Stream</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Academic Integrity Audit</h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Global log of all proctoring events recorded across exams, with FaceAPI telemetry and tab switch timestamps.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 shadow-xs">
          {['all', 'warning', 'critical', 'info'].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                severityFilter === s
                  ? 'glass-btn-primary shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/30'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">Loading proctoring event logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center glass-panel text-slate-600 text-sm font-medium">
            No proctoring logs matching criteria.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log._id}
              className="p-5 rounded-3xl glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-[0_10px_25px_rgba(15,23,42,0.04)]"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                    log.severity === 'critical'
                      ? 'bg-red-500/10 text-red-700 border-red-300 shadow-xs'
                      : 'bg-amber-500/10 text-amber-700 border-amber-300 shadow-xs'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{log.student?.name || 'Student Candidate'}</span>
                    <span className="text-slate-500">({log.student?.email})</span>
                    <span className="text-[10px] text-blue-600 font-mono font-bold">• {log.exam?.title}</span>
                  </div>
                  <p className="text-slate-700 mt-1 font-medium">{log.details}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:text-right shrink-0">
                <span
                  className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                    log.severity === 'critical'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white/30 text-slate-800 border border-white/90 shadow-xs'
                  }`}
                >
                  {log.eventType} ({log.severity})
                </span>
                <span className="text-slate-500 font-mono text-[11px] font-medium">
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
