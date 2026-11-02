import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Users,
  Eye,
  Filter,
  Radio,
  Clock,
  User,
} from 'lucide-react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

export default function TeacherProctoringPage() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [logs, setLogs] = useState([]);
  const [eventCounts, setEventCounts] = useState({});
  const [loading, setLoading] = useState(true);

  const socket = getSocket();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('/exams');
        if (res.data.success && res.data.exams.length > 0) {
          setExams(res.data.exams);
          setSelectedExamId(res.data.exams[0]._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const fetchLogs = async (examId) => {
    if (!examId) return;
    try {
      const res = await api.get(`/proctoring/exam/${examId}`);
      if (res.data.success) {
        setLogs(res.data.logs);
        setEventCounts(res.data.eventCounts || {});
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedExamId) {
      fetchLogs(selectedExamId);

      // Join socket room for real-time exam proctoring supervision
      socket.emit('join-exam-proctoring', { examId: selectedExamId });

      socket.on('proctoring-alert', (newAlert) => {
        setLogs((prev) => [newAlert, ...prev]);
        setEventCounts((prev) => ({
          ...prev,
          [newAlert.eventType]: (prev[newAlert.eventType] || 0) + 1,
        }));
      });
    }

    return () => {
      socket.off('proctoring-alert');
    };
  }, [selectedExamId]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-300 text-gray-800 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-4 h-4 text-black" />
            <span>FaceAPI.js Automated Integrity Auditor</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Proctoring Activity Logs</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Real-time audit log of student facial presence, multi-candidate detection, and browser tab shifts.
          </p>
        </div>

        {/* Exam Selector */}
        <div className="w-full sm:w-72">
          <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
            Filter Assessment
          </label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 font-bold"
          >
            {exams.map((ex) => (
              <option key={ex._id} value={ex._id}>
                {ex.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-red-700">Face Not Detected</span>
          <p className="text-2xl font-black text-gray-900 mt-2">{eventCounts.FACE_NOT_DETECTED || 0}</p>
          <span className="text-[10px] text-gray-500">Absence alerts</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-red-700">Multiple Faces</span>
          <p className="text-2xl font-black text-red-600 mt-2">{eventCounts.MULTIPLE_FACES_DETECTED || 0}</p>
          <span className="text-[10px] text-gray-500">Potential interference</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Tab / Window Blur</span>
          <p className="text-2xl font-black text-amber-600 mt-2">{eventCounts.TAB_WINDOW_SWITCH || 0}</p>
          <span className="text-[10px] text-gray-500">Window focus lost</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-900">Total Logs</span>
          <p className="text-2xl font-black text-gray-900 mt-2">{logs.length}</p>
          <span className="text-[10px] text-gray-700 font-bold">● Real-time stream active</span>
        </div>
      </div>

      {/* Proctoring Event Table */}
      <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Radio className="w-4 h-4 text-black animate-pulse" />
            Audit Event Timeline ({logs.length} entries)
          </h3>
          <span className="text-[11px] text-gray-500 font-mono">Auto-synced to MongoDB</span>
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">
            No proctoring violations recorded for this assessment.
          </p>
        ) : (
          <div className="space-y-3">
            {logs.map((log, idx) => (
              <div
                key={log._id || idx}
                className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      log.severity === 'critical'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">
                        {log.student?.name || log.studentName || 'Alex Turner'}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-0.5">{log.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border ${
                      log.severity === 'critical'
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : 'bg-amber-50 border-amber-300 text-amber-800'
                    }`}
                  >
                    {log.eventType?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
