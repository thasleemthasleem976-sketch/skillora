import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    timeLimitMinutes: {
      type: Number,
      default: 15,
    },
    passingPercentage: {
      type: Number,
      default: 60,
    },
    questions: [
      {
        questionText: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctOptionIndex: { type: Number, required: true },
        explanation: { type: String, default: '' },
      },
    ],
    attempts: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        score: Number,
        totalQuestions: Number,
        passed: Boolean,
        submittedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Quiz', quizSchema);
