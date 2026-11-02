import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import ExamResult from '../models/ExamResult.js';
import ProctoringLog from '../models/ProctoringLog.js';

// @desc    Get all exams (for catalog / student portal)
// @route   GET /api/exams
export const getAllExams = async (req, res, next) => {
  try {
    const { courseId } = req.query;
    let query = { status: { $ne: 'archived' } };
    if (courseId) query.course = courseId;

    const exams = await Exam.find(query)
      .populate('course', 'title category thumbnail')
      .populate('instructor', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: exams.length, exams });
  } catch (error) {
    next(error);
  }
};

// @desc    Get exam for student to take (omits correct answers for integrity)
// @route   GET /api/exams/:id/take
export const getExamForStudent = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('course', 'title')
      .populate({
        path: 'questions',
        select: '-correctOptionIndex -explanation', // Omit answers
        options: { sort: { order: 1 } },
      });

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Check if student already submitted this exam
    const existingResult = await ExamResult.findOne({
      student: req.user._id,
      exam: exam._id,
    });

    res.json({
      success: true,
      exam,
      alreadySubmitted: Boolean(existingResult),
      existingResultId: existingResult ? existingResult._id : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get exam with full question and answer details (Teacher/Admin)
// @route   GET /api/exams/:id
export const getExamById = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('course', 'title')
      .populate('instructor', 'name email')
      .populate('questions');

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    res.json({ success: true, exam });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new exam with questions (Teacher/Admin)
// @route   POST /api/exams
export const createExam = async (req, res, next) => {
  try {
    const {
      title,
      courseId,
      description,
      durationMinutes,
      passingPercentage,
      totalMarks,
      proctoringConfig,
      questionsData,
    } = req.body;

    const exam = await Exam.create({
      title,
      course: courseId,
      instructor: req.user._id,
      description: description || '',
      durationMinutes: durationMinutes || 30,
      passingPercentage: passingPercentage || 60,
      totalMarks: totalMarks || 100,
      proctoringConfig: proctoringConfig || {
        requireWebcam: true,
        detectMultipleFaces: true,
        detectFaceAbsence: true,
        detectHeadPose: true,
        detectTabSwitch: true,
      },
    });

    // Create questions if provided
    if (questionsData && Array.isArray(questionsData) && questionsData.length > 0) {
      const questionDocs = questionsData.map((q, idx) => ({
        exam: exam._id,
        questionText: q.questionText,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        marks: q.marks || Math.round((exam.totalMarks / questionsData.length) * 10) / 10 || 1,
        explanation: q.explanation || '',
        order: idx + 1,
      }));

      const createdQuestions = await Question.insertMany(questionDocs);
      exam.questions = createdQuestions.map((q) => q._id);
      await exam.save();
    }

    res.status(201).json({
      success: true,
      message: 'Exam and questions created successfully',
      exam,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit student exam & calculate instant score and PASS/FAIL result
// @route   POST /api/exams/:id/submit
export const submitExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answers, timeSpentSeconds, proctoringViolationCount } = req.body;
    const studentId = req.user._id;

    const exam = await Exam.findById(id).populate('questions');
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;
    let score = 0;
    const evaluatedAnswers = [];

    // Map questions by ID for fast lookup
    const questionMap = new Map();
    exam.questions.forEach((q) => {
      questionMap.set(q._id.toString(), q);
    });

    const totalQuestions = exam.questions.length;

    // Evaluate answers
    exam.questions.forEach((question) => {
      const qIdStr = question._id.toString();
      const submittedAns = answers?.find((a) => a.questionId?.toString() === qIdStr);
      const selectedOption = submittedAns ? submittedAns.selectedOption : -1;

      if (selectedOption === -1 || selectedOption === undefined || selectedOption === null) {
        unanswered += 1;
        evaluatedAnswers.push({
          questionId: question._id,
          selectedOption: -1,
          isCorrect: false,
          marksObtained: 0,
        });
      } else if (selectedOption === question.correctOptionIndex) {
        correctAnswers += 1;
        score += question.marks || 1;
        evaluatedAnswers.push({
          questionId: question._id,
          selectedOption,
          isCorrect: true,
          marksObtained: question.marks || 1,
        });
      } else {
        wrongAnswers += 1;
        evaluatedAnswers.push({
          questionId: question._id,
          selectedOption,
          isCorrect: false,
          marksObtained: 0,
        });
      }
    });

    // Compute total marks
    const computedTotalMarks = exam.questions.reduce((acc, q) => acc + (q.marks || 1), 0) || 100;
    const percentage = Math.round((score / computedTotalMarks) * 100);
    const status = percentage >= exam.passingPercentage ? 'PASS' : 'FAIL';

    // Retrieve proctoring log count for this student & exam
    const loggedViolations = await ProctoringLog.countDocuments({
      exam: exam._id,
      student: studentId,
      severity: { $in: ['warning', 'critical'] },
    });

    const finalViolationCount = Math.max(loggedViolations, proctoringViolationCount || 0);

    const examResult = await ExamResult.create({
      student: studentId,
      exam: exam._id,
      answers: evaluatedAnswers,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      unanswered,
      score,
      totalMarks: computedTotalMarks,
      percentage,
      status,
      timeSpentSeconds: timeSpentSeconds || 0,
      proctoringViolationCount: finalViolationCount,
      proctoringNotes: finalViolationCount > 0 ? `${finalViolationCount} automated proctoring alerts recorded during session.` : 'Clean examination session.',
      submittedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Exam submitted successfully',
      result: {
        _id: examResult._id,
        examTitle: exam.title,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        unanswered,
        score,
        totalMarks: computedTotalMarks,
        percentage,
        status, // PASS or FAIL
        timeSpentSeconds,
        proctoringViolationCount: finalViolationCount,
        passingPercentage: exam.passingPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get result by ID
// @route   GET /api/exams/result/:resultId
export const getExamResultById = async (req, res, next) => {
  try {
    const result = await ExamResult.findById(req.params.resultId)
      .populate('student', 'name email avatar')
      .populate({
        path: 'exam',
        populate: { path: 'course', select: 'title category' },
      });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Exam result not found' });
    }

    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's exam history
// @route   GET /api/exams/my-results
export const getMyExamResults = async (req, res, next) => {
  try {
    const results = await ExamResult.find({ student: req.user._id })
      .populate({
        path: 'exam',
        select: 'title passingPercentage durationMinutes course',
        populate: { path: 'course', select: 'title' },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: results.length, results });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all student results for an exam (Teacher/Admin)
// @route   GET /api/exams/:id/results
export const getExamResultsForTeacher = async (req, res, next) => {
  try {
    const results = await ExamResult.find({ exam: req.params.id })
      .populate('student', 'name email avatar')
      .sort({ score: -1 });

    res.json({ success: true, count: results.length, results });
  } catch (error) {
    next(error);
  }
};
