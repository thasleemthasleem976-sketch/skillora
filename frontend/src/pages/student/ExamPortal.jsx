import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle,
  AlertTriangle,
  Send,
  HelpCircle,
  X,
} from 'lucide-react';
import api from '../../services/api';
import ProctoringWebcamBox from '../../components/proctoring/ProctoringWebcamBox';
import LiquidBackground from '../../components/common/LiquidBackground';
import { useNotifications } from '../../context/NotificationContext';

export default function ExamPortal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { triggerToastAlert } = useNotifications();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: optionIndex }
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const startTimeRef = useRef(Date.now());

  // Fetch Exam Data
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get(`/exams/${id}/take`);
        if (res.data.success) {
          if (res.data.alreadySubmitted) {
            triggerToastAlert('You have already completed this exam.', 'info');
            navigate(`/exam-result/${res.data.existingResultId}`);
            return;
          }

          setExam(res.data.exam);
          setQuestions(res.data.exam.questions || []);
          setTimeLeftSeconds((res.data.exam.durationMinutes || 30) * 60);
        }
      } catch (err) {
        console.error('Failed to load exam:', err);
        triggerToastAlert('Could not load examination questions.', 'critical');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  // Countdown Timer & Auto-Submit on Expiry
  useEffect(() => {
    if (loading || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerToastAlert('Time expired! Submitting examination automatically.', 'critical');
          handleSubmitExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, timeLeftSeconds]);

  // Format time mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (optionIndex) => {
    if (!currentQuestion) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion._id]: optionIndex,
    }));
  };

  const handleClearOption = () => {
    if (!currentQuestion) return;
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQuestion._id];
      return copy;
    });
  };

  const toggleFlagQuestion = () => {
    if (!currentQuestion) return;
    setFlaggedQuestions((prev) => {
      const copy = new Set(prev);
      if (copy.has(currentQuestion._id)) {
        copy.delete(currentQuestion._id);
      } else {
        copy.add(currentQuestion._id);
      }
      return copy;
    });
  };

  // Submit Exam to Backend
  const handleSubmitExam = async (isAutoSubmit = false) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const answersPayload = questions.map((q) => ({
        questionId: q._id,
        selectedOption: selectedAnswers[q._id] !== undefined ? selectedAnswers[q._id] : -1,
      }));

      const timeSpentSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

      const res = await api.post(`/exams/${id}/submit`, {
        answers: answersPayload,
        timeSpentSeconds,
        proctoringViolationCount: violationCount,
      });

      if (res.data.success) {
        triggerToastAlert('Exam submitted and graded successfully!', 'info');
        navigate(`/exam-result/${res.data.result._id}`);
      }
    } catch (err) {
      console.error('Submit error:', err);
      triggerToastAlert('Error submitting exam answers.', 'critical');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500 font-bold">
        Preparing secure proctored examination environment...
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-600 font-bold">
        No questions available for this exam.
      </div>
    );
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const flaggedCount = flaggedQuestions.size;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="relative min-h-screen text-gray-900 flex flex-col select-none overflow-x-hidden">
      {/* Liquid Mesh Ambient Background */}
      <LiquidBackground />

      {/* Top Exam Navigation Bar in High-Graphics Glass */}
      <header className="h-16 glass-panel sticky top-0 z-40 px-6 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-black flex items-center justify-center font-bold text-white shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-gray-900 tracking-tight">{exam.title}</h1>
            <p className="text-[11px] text-gray-500 font-medium">
              Course: {exam.course?.title} • Automated AI Proctoring Active
            </p>
          </div>
        </div>

        {/* Timer Display */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-mono text-xs font-black backdrop-blur-md transition-all shadow-xs ${
              timeLeftSeconds < 300
                ? 'bg-red-500/10 border border-red-300 text-red-700 animate-pulse'
                : 'bg-white/30 border border-white text-gray-900'
            }`}
          >
            <Clock className="w-4 h-4 text-black" />
            <span>Time Remaining: {formatTime(timeLeftSeconds)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-5 py-2 rounded-2xl glass-btn-primary text-xs font-bold transition-all flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            Finish & Submit
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Question Card & Navigation (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Status Counter Bar in Frosted Glass */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-3xl glass-card flex items-center justify-between">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Answered</span>
              <span className="text-base font-black text-gray-900">{answeredCount}</span>
            </div>
            <div className="p-4 rounded-3xl glass-card flex items-center justify-between">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Flagged</span>
              <span className="text-base font-black text-amber-700">{flaggedCount}</span>
            </div>
            <div className="p-4 rounded-3xl glass-card flex items-center justify-between">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Unanswered</span>
              <span className="text-base font-black text-gray-400">{unansweredCount}</span>
            </div>
          </div>

          {/* Active Question Box */}
          {currentQuestion && (
            <div className="p-8 rounded-3xl glass-card space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-500">
                    {currentQuestion.marks || 1} Marks
                  </span>
                  <button
                    onClick={toggleFlagQuestion}
                    className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${
                      flaggedQuestions.has(currentQuestion._id)
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : 'border-gray-200 text-gray-600 hover:text-black hover:bg-gray-50'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    {flaggedQuestions.has(currentQuestion._id) ? 'Flagged' : 'Flag'}
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <h2 className="text-lg font-bold text-gray-900 leading-relaxed">
                {currentQuestion.questionText}
              </h2>

              {/* Multiple Choice Options */}
              <div className="space-y-3 pt-2">
                {currentQuestion.options?.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQuestion._id] === optIdx;
                  const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`p-4 rounded-2xl border text-sm font-medium cursor-pointer transition-all flex items-center gap-3.5 ${
                        isSelected
                          ? 'bg-black text-white border-black shadow-xs font-bold'
                          : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-white text-black'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {letter}
                      </div>
                      <span className="flex-1">{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Clear Response Button */}
              {selectedAnswers[currentQuestion._id] !== undefined && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleClearOption}
                    className="text-xs text-gray-500 hover:text-red-600 font-bold transition-colors"
                  >
                    Clear Choice
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
              disabled={currentIndex === 0}
              className="px-5 py-2.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-40 text-xs font-bold text-gray-800 transition-all flex items-center gap-2 shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Question
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((idx) => Math.min(questions.length - 1, idx + 1))}
                className="px-5 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-xs font-bold text-white transition-all shadow-xs flex items-center gap-2"
              >
                Next Question <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-6 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-xs font-bold text-white transition-all shadow-xs flex items-center gap-2"
              >
                Submit Exam <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Automated Proctoring Box & Question Palette */}
        <div className="space-y-6">
          {/* Automated Proctoring Box */}
          <ProctoringWebcamBox
            examId={exam._id}
            onViolationCountChange={(count) => setViolationCount(count)}
          />

          {/* Question Palette */}
          <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Question Palette
              </h3>
              <span className="text-[11px] text-gray-500 font-mono">
                {questions.length} Total
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = selectedAnswers[q._id] !== undefined;
                const isFlagged = flaggedQuestions.has(q._id);

                return (
                  <button
                    key={q._id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl text-xs font-bold transition-all relative ${
                      isCurrent
                        ? 'ring-2 ring-black bg-black text-white'
                        : isAnswered
                        ? 'bg-gray-800 text-white'
                        : isFlagged
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-gray-300 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Submit Examination?</h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-gray-400 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              You have answered <span className="font-bold text-gray-900">{answeredCount}</span> of{' '}
              <span className="font-bold text-gray-900">{questions.length}</span> questions.
              {unansweredCount > 0 && (
                <span className="block mt-1 text-amber-700 font-semibold">
                  ⚠️ You have {unansweredCount} unanswered questions remaining.
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Keep Reviewing
              </button>
              <button
                onClick={() => handleSubmitExam(false)}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold shadow-xs"
              >
                {submitting ? 'Calculating Score...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
