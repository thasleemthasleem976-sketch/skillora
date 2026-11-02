import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Trash2, CheckCircle2, Award, Clock } from 'lucide-react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

export default function ExamBuilderPage() {
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [passingPercentage, setPassingPercentage] = useState(60);
  const [totalMarks, setTotalMarks] = useState(100);
  const [proctoringConfig, setProctoringConfig] = useState({
    requireWebcam: true,
    detectMultipleFaces: true,
    detectFaceAbsence: true,
    detectHeadPose: true,
    detectTabSwitch: true,
  });

  const [questions, setQuestions] = useState([
    {
      questionText: 'What is the primary benefit of React hooks?',
      options: [
        'They eliminate JavaScript syntax errors automatically',
        'They allow reuse of stateful logic between components without class inheritance',
        'They connect directly to relational database sockets',
        'They replace HTML5 canvas elements',
      ],
      correctOptionIndex: 1,
      marks: 25,
      explanation: 'Hooks let you use state and other React features without writing a class.',
    },
    {
      questionText: 'Which HTTP status code is used for partial content range video streaming?',
      options: ['200 OK', '206 Partial Content', '304 Not Modified', '404 Not Found'],
      correctOptionIndex: 1,
      marks: 25,
      explanation: 'HTTP 206 enables byte-range chunks for video seek and buffer operations.',
    },
  ]);

  const { triggerToastAlert } = useNotifications();

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [cRes, eRes] = await Promise.all([
          api.get('/courses/teacher/my-courses'),
          api.get('/exams'),
        ]);
        if (cRes.data.success) {
          setCourses(cRes.data.courses);
          if (cRes.data.courses.length > 0) {
            setCourseId(cRes.data.courses[0]._id);
          }
        }
        if (eRes.data.success) {
          setExams(eRes.data.exams);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchInit();
  }, []);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        marks: 25,
        explanation: '',
      },
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx, field, value) => {
    const updated = [...questions];
    updated[idx][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx, optIdx, val) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = val;
    setQuestions(updated);
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!title || !courseId) {
      triggerToastAlert('Please fill in exam title and select course', 'warning');
      return;
    }

    try {
      const res = await api.post('/exams', {
        title,
        courseId,
        description,
        durationMinutes,
        passingPercentage,
        totalMarks,
        proctoringConfig,
        questionsData: questions,
      });

      if (res.data.success) {
        triggerToastAlert('Exam & proctored questions saved!', 'info');
        setTitle('');
        setDescription('');
        // Refresh exams
        const eRes = await api.get('/exams');
        if (eRes.data.success) setExams(eRes.data.exams);
      }
    } catch (err) {
      triggerToastAlert('Failed to create exam', 'warning');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Proctored Exam Builder</h1>
        <p className="text-sm text-gray-600 mt-1">
          Create timed multiple-choice examinations with FaceAPI.js automated proctoring rules.
        </p>
      </div>

      <form onSubmit={handleCreateExam} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Exam Settings (Left col) */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-5 h-fit">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-black" />
            Exam Parameters
          </h3>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Exam Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. React & State Machine Midterm"
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Target Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Description</label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions for students..."
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Duration (Mins)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Pass Mark (%)</label>
              <input
                type="number"
                value={passingPercentage}
                onChange={(e) => setPassingPercentage(parseInt(e.target.value))}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
              />
            </div>
          </div>

          {/* Automated Proctoring Configuration */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-black" />
              Proctoring Safeguards
            </span>
            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={proctoringConfig.requireWebcam}
                onChange={(e) =>
                  setProctoringConfig({ ...proctoringConfig, requireWebcam: e.target.checked })
                }
                className="accent-black"
              />
              Require continuous webcam feed
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={proctoringConfig.detectMultipleFaces}
                onChange={(e) =>
                  setProctoringConfig({ ...proctoringConfig, detectMultipleFaces: e.target.checked })
                }
                className="accent-black"
              />
              Alert on multiple faces
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={proctoringConfig.detectTabSwitch}
                onChange={(e) =>
                  setProctoringConfig({ ...proctoringConfig, detectTabSwitch: e.target.checked })
                }
                className="accent-black"
              />
              Track tab / window focus blur
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold shadow-xs"
          >
            Publish Proctored Exam
          </button>
        </div>

        {/* Questions Builder List (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Questions ({questions.length})</h3>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-bold border border-gray-300 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Question
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((q, qIdx) => (
              <div
                key={qIdx}
                className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Question #{qIdx + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="text-gray-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    required
                    value={q.questionText}
                    onChange={(e) => handleQuestionChange(qIdx, 'questionText', e.target.value)}
                    placeholder="Enter multiple choice question prompt..."
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                  />
                </div>

                {/* 4 Choices */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
                    Options & Correct Answer
                  </span>
                  {q.options?.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={q.correctOptionIndex === optIdx}
                        onChange={() => handleQuestionChange(qIdx, 'correctOptionIndex', optIdx)}
                        className="accent-black cursor-pointer"
                        title="Mark as correct answer"
                      />
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                        className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-900"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <input
                    type="text"
                    value={q.explanation}
                    onChange={(e) => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                    placeholder="Answer explanation shown to student upon completion..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-600 placeholder-gray-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
