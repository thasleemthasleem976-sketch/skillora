import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
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
      required: true,
    },
    instructions: {
      type: String,
      default: '',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    submissions: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: {
          type: String,
          default: '',
        },
        attachmentUrl: {
          type: String,
          default: '',
        },
        submittedAt: {
          type: Date,
          default: Date.now,
        },
        grade: {
          type: Number,
          default: null,
        },
        feedback: {
          type: String,
          default: '',
        },
        status: {
          type: String,
          enum: ['submitted', 'graded', 'late'],
          default: 'submitted',
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Assignment', assignmentSchema);
