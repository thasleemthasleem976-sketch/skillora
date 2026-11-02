import Quiz from '../models/Quiz.js';
import Course from '../models/Course.js';

// @desc    Get quizzes for a course (or all quizzes)
// @route   GET /api/quizzes
export const getQuizzes = async (req, res, next) => {
  try {
    const { courseId } = req.query;
    let query = {};
    if (courseId) query.course = courseId;

    const quizzes = await Quiz.find(query)
      .populate('course', 'title category')
      .populate('instructor', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: quizzes.length, quizzes });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single quiz (strips answers if student)
// @route   GET /api/quizzes/:id
export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('course', 'title')
      .populate('instructor', 'name avatar');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    let quizData = quiz.toObject();
    if (req.user.role === 'student') {
      quizData.questions = quizData.questions.map((q) => {
        const { correctOptionIndex, explanation, ...rest } = q;
        return rest;
      });
    }

    res.json({ success: true, quiz: quizData });
  } catch (error) {
    next(error);
  }
};

// @desc    Create quiz (Teacher/Admin)
// @route   POST /api/quizzes
export const createQuiz = async (req, res, next) => {
  try {
    const { title, courseId, description, timeLimitMinutes, passingPercentage, questions } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const normalizedQuestions = (questions || []).map((q) => ({
      questionText: q.questionText || q.question || '',
      options: q.options || [],
      correctOptionIndex: q.correctOptionIndex !== undefined ? q.correctOptionIndex : (q.correctAnswer !== undefined ? q.correctAnswer : 0),
      explanation: q.explanation || '',
    }));

    const quiz = await Quiz.create({
      title,
      course: courseId,
      instructor: req.user._id,
      description: description || '',
      timeLimitMinutes: timeLimitMinutes || 15,
      passingPercentage: passingPercentage || 60,
      questions: normalizedQuestions,
    });

    res.status(201).json({ success: true, quiz, message: 'Quiz created successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quiz (Teacher/Admin)
// @route   PUT /api/quizzes/:id
export const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const updated = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, quiz: updated, message: 'Quiz updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete quiz (Teacher/Admin)
// @route   DELETE /api/quizzes/:id
export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit quiz attempt & get instant result
// @route   POST /api/quizzes/:id/submit
export const submitQuizAttempt = async (req, res, next) => {
  try {
    const { answers } = req.body; // array of selected indices
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers && answers[idx] === q.correctOptionIndex) {
        correctCount += 1;
      }
    });

    const totalQuestions = quiz.questions.length;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = percentage >= quiz.passingPercentage;

    quiz.attempts.push({
      student: req.user._id,
      score: correctCount,
      totalQuestions,
      passed,
      submittedAt: new Date(),
    });

    await quiz.save();

    res.json({
      success: true,
      result: {
        score: correctCount,
        totalQuestions,
        percentage,
        passed,
        passingPercentage: quiz.passingPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};
