import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 1,
    },
    durationMinutes: {
      type: Number,
      default: 10,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
    },
    videoUrl: {
      type: String, // Direct accessible video streaming URL
      default: '',
    },
    isFreePreview: {
      type: Boolean,
      default: false,
    },
    resources: [
      {
        title: String,
        url: String,
        type: { type: String, default: 'link' },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Lesson', lessonSchema);
