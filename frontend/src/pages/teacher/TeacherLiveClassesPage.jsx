import React, { useState, useEffect } from 'react';
import { Radio, PlusCircle, Calendar, Clock, Video, X, CheckCircle2, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import LiveClassRoom from '../../components/live/LiveClassRoom';

export default function TeacherLiveClassesPage() {
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [form, setForm] = useState({
    title: '',
    courseId: '',
    description: '',
    durationMinutes: 60,
  });
  const { triggerToastAlert } = useNotifications();

  const fetchClasses = async () => {
    try {
      const [cRes, clRes] = await Promise.all([
        api.get('/courses/teacher/my-courses'),
        api.get('/live-classes'),
      ]);
      if (cRes.data.success) {
        setCourses(cRes.data.courses);
        if (cRes.data.courses.length > 0) {
          setForm((f) => ({ ...f, courseId: cRes.data.courses[0]._id }));
        }
      }
      if (clRes.data.success) {
        setClasses(clRes.data.liveClasses);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/live-classes', form);
      if (res.data.success) {
        triggerToastAlert('Live class scheduled successfully!', 'info');
        setShowModal(false);
        fetchClasses();
      }
    } catch (err) {
      triggerToastAlert('Failed to schedule class', 'warning');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative z-10">
      {/* Active WebRTC Live Room */}
      {activeSession && (
        <LiveClassRoom
          liveClass={activeSession}
          onLeave={() => {
            setActiveSession(null);
            fetchClasses();
          }}
        />
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-slate-800 text-xs font-bold shadow-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Interactive WebRTC Broadcast</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Live Video Classrooms</h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Host live interactive audio/video lectures, screen sharing, and automated attendance tracking.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl glass-btn-primary text-xs font-bold transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Schedule Live Class
        </button>
      </div>

      {/* Class Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length === 0 ? (
          <div className="col-span-full p-12 text-center glass-panel text-slate-500 text-sm font-medium">
            No live classes scheduled yet. Click "Schedule Live Class" to broadcast.
          </div>
        ) : (
          classes.map((cls) => (
            <div
              key={cls._id}
              className="p-6 rounded-3xl glass-card flex flex-col justify-between space-y-4 shadow-[0_15px_35px_rgba(15,23,42,0.06)]"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      cls.status === 'live'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : cls.status === 'completed'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-white/30 text-slate-800 border border-white/90 shadow-xs'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${cls.status === 'live' ? 'bg-white animate-ping' : 'bg-slate-400'}`}
                    ></span>
                    {cls.status}
                  </span>

                  <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" /> {cls.durationMinutes || 60} mins
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 line-clamp-1">{cls.title}</h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{cls.description}</p>
                <p className="text-[11px] font-mono text-slate-600 mt-2 font-semibold">
                  Course: {cls.course?.title || 'General Workshop'}
                </p>
              </div>

              <div className="pt-4 border-t border-white/60 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {cls.attendees?.length || 0} students recorded
                </span>

                <button
                  onClick={() => setActiveSession(cls)}
                  className="px-5 py-2.5 rounded-xl glass-btn-primary text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Video className="w-4 h-4" />
                  <span>Enter Room</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule Modal in Glass Panel */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel border border-white/90 p-8 max-w-md w-full shadow-[0_25px_60px_rgba(15,23,42,0.25)] space-y-5">
            <div className="flex items-center justify-between border-b border-white/60 pb-3">
              <h3 className="font-black text-slate-900 text-base">Schedule New Live Class</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl bg-white/60 hover:bg-white text-slate-500 hover:text-slate-900 border border-white/80 transition-all shadow-xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5 text-[11px]">
                  Session Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masterclass: Node.js Microservices"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-3 glass-input rounded-2xl text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5 text-[11px]">
                  Associated Course
                </label>
                <select
                  value={form.courseId}
                  onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                  className="w-full p-3 glass-input rounded-2xl text-slate-900 text-xs font-bold"
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5 text-[11px]">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="180"
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                  className="w-full p-3 glass-input rounded-2xl text-slate-900 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1.5 text-[11px]">
                  Description & Agenda
                </label>
                <textarea
                  rows="3"
                  placeholder="What will be discussed during this session..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3 glass-input rounded-2xl text-slate-900 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/60">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-2xl text-slate-600 hover:text-slate-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl glass-btn-primary font-bold shadow-md"
                >
                  Schedule Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
