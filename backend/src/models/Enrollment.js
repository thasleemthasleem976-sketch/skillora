import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastAccessedLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    // Map of lessonId to playback details { currentTime: Number, duration: Number, completed: Boolean }
    videoPlaybackState: {
      type: Map,
      of: new mongoose.Schema(
        {
          currentTime: { type: Number, default: 0 },
          duration: { type: Number, default: 0 },
          lastUpdated: { type: Date, default: Date.now },
        },
        { _id: false }
      ),
      default: {},
    },
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.model('Enrollment', enrollmentSchema);
