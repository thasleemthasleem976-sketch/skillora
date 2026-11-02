import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true, // Video streaming URL (Cloudinary or optimized local streaming endpoint)
    },
    storageProvider: {
      type: String,
      enum: ['cloudinary', 's3', 'local-streaming'],
      default: 'local-streaming',
    },
    publicId: {
      type: String,
      default: '',
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    size: {
      type: Number, // in bytes
      default: 0,
    },
    format: {
      type: String,
      default: 'mp4',
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Video', videoSchema);
