import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, Clock, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';
import api from '../../services/api';

export default function ResultsHistoryPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get('/exams/my-results');
        if (res.data.success) {
          setResults(res.data.results);
        }
      } catch (err) {
        console.error('Error fetching results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Examination Results</h1>
        <p className="text-sm text-gray-600 mt-1">
          Historical overview of all completed proctored assessments, scores, and proctoring audit logs.
        </p>
      </div>

      {results.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-gray-200 space-y-4">
          <Award className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">No exam results recorded</h3>
          <p className="text-xs text-gray-500">You have not completed any proctored exams yet.</p>
          <Link
            to="/exams"
            className="inline-block px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold"
          >
            Take Online Exam
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((res) => (
            <div
              key={res._id}
              className="p-6 rounded-3xl bg-white border border-gray-200 hover:border-gray-300 transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md border ${
                      res.status === 'PASS'
                        ? 'bg-black text-white border-black'
                        : 'bg-red-50 text-red-700 border-red-300'
                    }`}
                  >
                    {res.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(res.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900">{res.exam?.title || 'Exam'}</h3>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span>
                    Score: <strong className="text-gray-900">{res.score}</strong> / {res.totalMarks} (
                    {res.percentage}%)
                  </span>
                  <span>•</span>
                  <span>
                    Correct: <strong className="text-gray-900">{res.correctAnswers}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Wrong: <strong className="text-gray-500">{res.wrongAnswers}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    {res.proctoringViolationCount > 0 ? (
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 text-black" />
                    )}
                    {res.proctoringViolationCount} Alerts
                  </span>
                </div>
              </div>

              <Link
                to={`/exam-result/${res._id}`}
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-black hover:text-white text-gray-800 text-xs font-bold transition-all border border-gray-300 flex items-center gap-2"
              >
                View Full Scorecard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
