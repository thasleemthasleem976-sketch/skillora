import mongoose from 'mongoose';

const examResultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
          required: true,
        },
        selectedOption: {
          type: Number, // index 0..3, or -1 if skipped
          default: -1,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
        marksObtained: {
          type: Number,
          default: 0,
        },
      },
    ],
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    wrongAnswers: {
      type: Number,
      required: true,
    },
    unanswered: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['PASS', 'FAIL'],
      required: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
    proctoringViolationCount: {
      type: Number,
      default: 0,
    },
    proctoringNotes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('ExamResult', examResultSchema);
