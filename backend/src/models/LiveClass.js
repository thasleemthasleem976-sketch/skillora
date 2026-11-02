import mongoose from 'mongoose';

const liveClassSchema = new mongoose.Schema(
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
    scheduledStartTime: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 60,
    },
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'ended'],
      default: 'scheduled',
    },
    attendance: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        leftAt: {
          type: Date,
        },
        durationMinutes: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('LiveClass', liveClassSchema);
