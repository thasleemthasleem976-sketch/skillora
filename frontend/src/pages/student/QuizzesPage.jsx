import React, { useState, useEffect } from 'react';
import { HelpCircle, Clock, CheckCircle2, Award, X, BookOpen, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const { triggerToastAlert } = useNotifications();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await api.get('/quizzes');
        if (res.data.success) {
          setQuizzes(res.data.quizzes);
        }
      } catch (err) {
        console.error('Error fetching quizzes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleStartQuiz = async (quizId) => {
    try {
      const res = await api.get(`/quizzes/${quizId}`);
      if (res.data.success) {
        setActiveQuiz(res.data.quiz);
        setSelectedAnswers({});
        setQuizResult(null);
      }
    } catch (err) {
      triggerToastAlert('Could not load quiz questions', 'warning');
    }
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    try {
      const answersArray = activeQuiz.questions.map((_, idx) =>
        selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1
      );

      const res = await api.post(`/quizzes/${activeQuiz._id}/submit`, {
        answers: answersArray,
      });

      if (res.data.success) {
        setQuizResult(res.data.result);
        triggerToastAlert('Quiz evaluated successfully!', 'info');
      }
    } catch (err) {
      triggerToastAlert('Failed to submit quiz attempt.', 'warning');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative z-10">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-slate-800 text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Formative Assessment Engine</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Interactive Course Quizzes</h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Take quizzes created by academic administrators and instructors to assess your comprehension of course topics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div
            key={quiz._id}
            className="p-6 rounded-3xl glass-card flex flex-col justify-between space-y-5 shadow-[0_15px_35px_rgba(15,23,42,0.06)]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-white/30 text-slate-800 border border-white/90 shadow-xs">
                  {quiz.course?.title || 'Course'}
                </span>
                <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {quiz.timeLimitMinutes || 15} mins
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{quiz.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{quiz.description}</p>
              <div className="pt-2 border-t border-white/60 text-xs text-slate-500 flex items-center justify-between font-medium">
                <span>{quiz.questions?.length || 0} Questions</span>
                <span className="font-bold text-slate-900">Pass mark: {quiz.passingPercentage}%</span>
              </div>
            </div>

            <button
              onClick={() => handleStartQuiz(quiz._id)}
              className="w-full py-3 rounded-2xl glass-btn-primary text-xs font-bold flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              Take Quiz
            </button>
          </div>
        ))}
      </div>

      {/* Quiz Glass Modal */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl glass-panel border border-white/90 p-8 shadow-[0_25px_60px_rgba(15,23,42,0.25)] space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/60">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">{activeQuiz.title}</h3>
                <span className="text-xs text-slate-500 font-medium">Time limit: {activeQuiz.timeLimitMinutes} mins</span>
              </div>
              <button
                onClick={() => setActiveQuiz(null)}
                className="p-1.5 rounded-xl bg-white/60 hover:bg-white text-slate-600 hover:text-slate-900 border border-white/80 transition-all shadow-xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quizResult ? (
              <div className="p-8 rounded-3xl bg-white/70 backdrop-blur-md border border-white/90 text-center space-y-4 shadow-sm">
                <div
                  className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-md ${
                    quizResult.passed ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  <Award className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-slate-900">
                  Quiz Result: {quizResult.passed ? 'PASSED' : 'TRY AGAIN'}
                </h4>
                <p className="text-sm text-slate-600">
                  You scored <span className="font-black text-slate-900">{quizResult.score}</span> out of{' '}
                  <span className="font-black text-slate-900">{quizResult.totalQuestions}</span> (
                  {quizResult.percentage}%)
                </p>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="px-6 py-2.5 glass-btn-primary rounded-2xl text-xs font-bold"
                >
                  Close Quiz
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {activeQuiz.questions?.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-3 p-5 rounded-3xl bg-white/60 backdrop-blur-md border border-white/80 shadow-xs">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Question {qIdx + 1} of {activeQuiz.questions.length}
                    </p>
                    <h4 className="text-sm font-bold text-slate-900">{q.questionText}</h4>
                    <div className="space-y-2">
                      {q.options?.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          onClick={() =>
                            setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
                          }
                          className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                            selectedAnswers[qIdx] === optIdx
                              ? 'bg-slate-900 text-white font-bold shadow-xs border-slate-900'
                              : 'bg-white/30 border-white/90 text-slate-800 hover:bg-white hover:border-white shadow-xs'
                          }`}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-end gap-3 pt-3 border-t border-white/60">
                  <button
                    onClick={() => setActiveQuiz(null)}
                    className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitQuiz}
                    className="px-6 py-2.5 rounded-2xl glass-btn-primary text-xs font-bold"
                  >
                    Submit Answers
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
