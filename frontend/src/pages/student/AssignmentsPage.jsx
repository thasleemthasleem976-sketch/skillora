import React, { useState, useEffect } from 'react';
import { FileText, Calendar, CheckCircle2, Upload, ExternalLink, X } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function AssignmentsPage() {
  const { user } = useAuth();
  const { triggerToastAlert } = useNotifications();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/assignments');
      if (res.data.success) {
        setAssignments(res.data.assignments);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleOpenSubmit = (assignment) => {
    setSelectedAssignment(assignment);
    const existing = assignment.submissions?.find((s) => s.student === user?._id);
    setSubmissionContent(existing ? existing.content : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionContent.trim() || !selectedAssignment) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/assignments/${selectedAssignment._id}/submit`, {
        content: submissionContent,
      });
      if (res.data.success) {
        triggerToastAlert('Assignment submitted successfully!', 'info');
        setSelectedAssignment(null);
        fetchAssignments();
      }
    } catch (err) {
      triggerToastAlert('Failed to submit assignment.', 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Assignments & Projects</h1>
        <p className="text-sm text-gray-600 mt-1">
          Submit code projects, implementation reports, and view feedback from your instructors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.map((asgn) => {
          const userSub = asgn.submissions?.find((s) => s.student === user?._id);
          const isSubmitted = Boolean(userSub);

          return (
            <div
              key={asgn._id}
              className="p-6 rounded-3xl bg-white border border-gray-200 hover:border-gray-300 transition-all shadow-xs flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                    {asgn.course?.title || 'Course'}
                  </span>
                  <span className="text-xs font-mono text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Due: {new Date(asgn.dueDate).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900">{asgn.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{asgn.description}</p>

                {/* Grade display if graded */}
                {userSub && userSub.grade !== null && (
                  <div className="p-3 rounded-xl bg-gray-100 border border-gray-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-gray-900">
                      <span>Grade Received:</span>
                      <span>{userSub.grade} / {asgn.maxScore}</span>
                    </div>
                    {userSub.feedback && (
                      <p className="text-[11px] text-gray-600 mt-1">Feedback: {userSub.feedback}</p>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleOpenSubmit(asgn)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isSubmitted
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                    : 'bg-black hover:bg-gray-800 text-white shadow-xs'
                }`}
              >
                <Upload className="w-4 h-4" />
                {isSubmitted ? 'Update Submission' : 'Submit Solution'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-gray-300 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">{selectedAssignment.title}</h3>
                <p className="text-xs text-gray-500">Submit your code repository link or project solution</p>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="text-gray-400 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Submission Notes or Repository Link
                </label>
                <textarea
                  rows="5"
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="Paste GitHub link or explain your implementation..."
                  className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold shadow-xs"
                >
                  {submitting ? 'Submitting...' : 'Upload Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
