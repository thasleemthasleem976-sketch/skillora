import mongoose from 'mongoose';

const proctoringLogSchema = new mongoose.Schema(
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
    eventType: {
      type: String,
      enum: [
        'FACE_NOT_DETECTED',
        'MULTIPLE_FACES_DETECTED',
        'TAB_WINDOW_SWITCH',
        'SUSPICIOUS_HEAD_MOVEMENT',
        'FULLSCREEN_EXITED',
        'AUDIO_NOISE_DETECTED',
        'EXAM_STARTED',
        'EXAM_SUBMITTED',
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'warning',
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metaData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

proctoringLogSchema.index({ exam: 1, student: 1, timestamp: -1 });

export default mongoose.model('ProctoringLog', proctoringLogSchema);
