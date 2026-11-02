import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    options: [
      {
        type: String,
        required: true,
      },
    ],
    correctOptionIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    marks: {
      type: Number,
      default: 1,
    },
    explanation: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Question', questionSchema);
