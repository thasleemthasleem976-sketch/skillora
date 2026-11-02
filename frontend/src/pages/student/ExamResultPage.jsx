import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';

export default function ExamResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/exams/result/${id}`);
        if (res.data.success) {
          setResult(res.data.result);
        }
      } catch (err) {
        console.error('Error fetching exam result:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-bold">
        Loading examination scorecard...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-12 text-center text-red-600 font-bold">
        Result not found.
      </div>
    );
  }

  const isPassed = result.status === 'PASS';

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 relative z-10">
      {/* Back button */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Hero Result Banner in Glass Panel */}
      <div className="p-8 rounded-3xl glass-panel shadow-[0_20px_50px_rgba(15,23,42,0.06)] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span
              className={`inline-block text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                isPassed
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              Assessment Result • {result.status}
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {result.exam?.title || 'Examination Summary'}
            </h1>
            <p className="text-xs text-slate-600">
              Candidate: <span className="font-bold text-slate-900">{result.student?.name}</span> • Submitted on{' '}
              {new Date(result.submittedAt).toLocaleDateString()} at{' '}
              {new Date(result.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* PASS / FAIL Badge with Specular Glass Chamfer */}
          <div
            className={`w-28 h-28 rounded-3xl flex flex-col items-center justify-center shrink-0 border-2 shadow-lg ${
              isPassed
                ? 'bg-slate-900 text-white border-white/20 shadow-[0_12px_30px_rgba(15,23,42,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)]'
                : 'bg-red-50 text-red-700 border-red-300 shadow-sm'
            }`}
          >
            <span className="text-2xl font-black">{result.status}</span>
            <span className="text-xs font-bold font-mono mt-0.5">{result.percentage}%</span>
          </div>
        </div>
      </div>

      {/* Required Scorecard Metrics Grid in High-Graphics Glass */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Questions */}
        <div className="p-5 rounded-3xl glass-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Questions</span>
          <p className="text-2xl font-black text-slate-900 mt-2">{result.totalQuestions}</p>
          <span className="text-[10px] text-slate-400 font-medium">100% evaluated</span>
        </div>

        {/* Correct Answers */}
        <div className="p-5 rounded-3xl glass-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Correct Answers</span>
          <p className="text-2xl font-black text-slate-900 mt-2">{result.correctAnswers}</p>
          <span className="text-[10px] text-slate-400 font-medium">Full points</span>
        </div>

        {/* Wrong Answers */}
        <div className="p-5 rounded-3xl glass-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Wrong Answers</span>
          <p className="text-2xl font-black text-slate-700 mt-2">{result.wrongAnswers}</p>
          <span className="text-[10px] text-slate-400 font-medium">0 points</span>
        </div>

        {/* Final Score */}
        <div className="p-5 rounded-3xl glass-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Final Score</span>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {result.score} <span className="text-xs font-normal text-slate-500">/ {result.totalMarks}</span>
          </p>
          <span className="text-[10px] text-slate-400 font-medium">Weighted marks</span>
        </div>

        {/* Percentage & Status */}
        <div className="p-5 rounded-3xl glass-card col-span-2 sm:col-span-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Percentage</span>
          <p className="text-2xl font-black text-slate-900 mt-2">{result.percentage}%</p>
          <span
            className={`text-[10px] font-bold uppercase ${
              isPassed ? 'text-slate-900' : 'text-red-600'
            }`}
          >
            {result.status} (Pass: {result.exam?.passingPercentage || 60}%)
          </span>
        </div>
      </div>

      {/* Automated Proctoring Audit Log Banner */}
      <div className="p-6 rounded-3xl glass-panel shadow-[0_15px_35px_rgba(15,23,42,0.06)] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`p-3 rounded-2xl ${
              result.proctoringViolationCount > 0
                ? 'bg-amber-100/90 text-amber-900 border border-amber-300'
                : 'bg-white/30 text-slate-900 border border-white/90 shadow-xs'
            }`}
          >
            {result.proctoringViolationCount > 0 ? (
              <ShieldAlert className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Automated Proctoring Assessment</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              {result.proctoringViolationCount > 0
                ? `${result.proctoringViolationCount} proctoring warning(s) logged (facial presence, multiple faces, or tab switches).`
                : 'Clean exam session. No suspicious proctoring alerts detected.'}
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-500 shrink-0 font-medium">
          FaceAPI Verified
        </span>
      </div>

      {/* Detailed Question Review List */}
      <div className="p-8 rounded-3xl glass-panel shadow-[0_15px_35px_rgba(15,23,42,0.06)] space-y-6">
        <div className="flex items-center justify-between border-b border-white/60 pb-4">
          <h3 className="text-base font-black text-slate-900">Question Evaluation Breakdown</h3>
          <span className="text-xs text-slate-500 font-mono font-medium">
            {result.answers?.length || 0} Questions Evaluated
          </span>
        </div>

        <div className="space-y-4">
          {result.answers?.map((ans, idx) => {
            const q = ans.questionId;
            const isCorrect = ans.isCorrect;

            return (
              <div
                key={idx}
                className={`p-5 rounded-3xl border transition-all ${
                  isCorrect
                    ? 'bg-white/60 border-white/80'
                    : 'bg-red-50/50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      Q{idx + 1}.
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {q?.questionText || `Question ${idx + 1}`}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-red-100 text-red-900'
                    }`}
                  >
                    {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-2xl bg-white/70 border border-white/90">
                    <span className="text-slate-500 font-medium">Your Answer:</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {q?.options?.[ans.selectedOption] || 'Not answered'}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/70 border border-white/90">
                    <span className="text-slate-500 font-medium">Correct Answer:</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {q?.options?.[q?.correctAnswer] || 'Official solution'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
