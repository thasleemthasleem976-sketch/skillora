import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
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
    durationMinutes: {
      type: Number,
      required: true,
      default: 30,
    },
    passingPercentage: {
      type: Number,
      required: true,
      default: 60,
    },
    totalMarks: {
      type: Number,
      default: 100,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    proctoringConfig: {
      requireWebcam: { type: Boolean, default: true },
      detectMultipleFaces: { type: Boolean, default: true },
      detectFaceAbsence: { type: Boolean, default: true },
      detectHeadPose: { type: Boolean, default: true },
      detectTabSwitch: { type: Boolean, default: true },
      maxViolationsBeforeWarning: { type: Number, default: 3 },
      strictMode: { type: Boolean, default: false },
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'archived'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Exam', examSchema);
