import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, HelpCircle, Award, AlertCircle, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import api from '../../services/api';

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const [examsRes, resultsRes] = await Promise.all([
          api.get('/exams'),
          api.get('/exams/my-results'),
        ]);

        if (examsRes.data.success) setExams(examsRes.data.exams);
        if (resultsRes.data.success) setMyResults(resultsRes.data.results);
      } catch (err) {
        console.error('Error fetching exams:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const getResultForExam = (examId) => {
    return myResults.find((r) => r.exam?._id === examId || r.exam === examId);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative z-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-slate-800 text-xs font-bold shadow-xs">
          <ShieldCheck className="w-4 h-4 text-slate-900" />
          <span>Secure Automated Proctoring</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Online Examinations</h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Timed assessments featuring real-time FaceAPI facial presence monitoring, multiple face alert detection, and window switch tracking.
        </p>
      </div>

      {/* Proctoring Guidelines Card in Glass Panel */}
      <div className="p-6 rounded-3xl glass-panel space-y-4 shadow-[0_15px_35px_rgba(15,23,42,0.06)]">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-slate-900" />
          Automated Proctoring Rules & Requirements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
          <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 space-y-1 shadow-xs">
            <span className="font-bold text-slate-900">1. Webcam Monitoring</span>
            <p className="text-slate-500">
              Webcam must remain enabled throughout the assessment. Continuous face presence is verified.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 space-y-1 shadow-xs">
            <span className="font-bold text-slate-900">2. No Window Switching</span>
            <p className="text-slate-500">
              Exiting full-screen or switching browser tabs generates recorded violation warnings.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 space-y-1 shadow-xs">
            <span className="font-bold text-slate-900">3. Single Candidate</span>
            <p className="text-slate-500">
              Multiple faces detected in the video stream will immediately raise a proctoring alert.
            </p>
          </div>
        </div>
      </div>

      {/* Available Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => {
          const pastResult = getResultForExam(exam._id);

          return (
            <div
              key={exam._id}
              className="p-6 rounded-3xl glass-card flex flex-col justify-between space-y-6 shadow-[0_15px_35px_rgba(15,23,42,0.06)]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-white/30 text-slate-800 border border-white/90 shadow-xs">
                    {exam.course?.category || 'Assessment'}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{exam.durationMinutes} Mins</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{exam.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {exam.description || 'Proctored comprehensive test.'}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-white/60 font-medium">
                  <span>Passing Mark: {exam.passingPercentage}%</span>
                  <span className="font-bold text-slate-900">Total Marks: {exam.totalMarks || 100}</span>
                </div>
              </div>

              {/* Status and Action */}
              <div className="pt-2">
                {pastResult ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500">Your Result:</span>
                      <span
                        className={
                          pastResult.status === 'PASS' ? 'text-slate-900 font-black' : 'text-red-600 font-black'
                        }
                      >
                        {pastResult.status} ({pastResult.percentage}%)
                      </span>
                    </div>
                    <Link
                      to={`/exam-result/${pastResult._id}`}
                      className="block text-center w-full py-2.5 rounded-2xl glass-btn-secondary text-xs font-bold transition-all"
                    >
                      View Detailed Result
                    </Link>
                  </div>
                ) : (
                  <Link
                    to={`/exam-portal/${exam._id}`}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl glass-btn-primary text-xs font-bold"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Start Proctored Exam
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
