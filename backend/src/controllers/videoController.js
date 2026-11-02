import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Video from '../models/Video.js';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { dispatchJob } from '../services/queueService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Upload video (Cloudinary if available, otherwise local stream storage)
// @route   POST /api/videos/upload
export const uploadVideoFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a video file' });
    }

    const { title, duration } = req.body;
    const originalName = req.file.originalname;
    const fileSize = req.file.size;
    const fileExt = path.extname(originalName).replace('.', '');

    let streamUrl = '';
    let storageProvider = 'local-streaming';
    let publicId = '';

    if (isCloudinaryConfigured) {
      try {
        console.log(`[Video Controller] Uploading ${originalName} to Cloudinary...`);
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: 'video',
          folder: 'skillora/videos',
          chunk_size: 6000000,
        });

        streamUrl = result.secure_url;
        storageProvider = 'cloudinary';
        publicId = result.public_id;

        // Clean up temporary local file after Cloudinary upload
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cloudErr) {
        console.error('[Cloudinary Upload Error, falling back to local stream]:', cloudErr.message);
        // Fallback to local streaming
        storageProvider = 'local-streaming';
      }
    }

    // If local streaming or Cloudinary upload fell back
    if (storageProvider === 'local-streaming') {
      const filename = path.basename(req.file.path);
      streamUrl = `/api/videos/stream/${filename}`;
    }

    const video = await Video.create({
      title: title || originalName.replace(/\.[^/.]+$/, ''),
      originalName,
      url: streamUrl,
      storageProvider,
      publicId,
      duration: duration ? parseFloat(duration) : 180, // default 3 mins if unspecified
      size: fileSize,
      format: fileExt,
      uploadedBy: req.user._id,
    });

    // Dispatch background processing job
    await dispatchJob('video-processing', 'transcode-and-index', {
      videoId: video._id,
      title: video.title,
      url: video.url,
    });

    res.status(201).json({
      success: true,
      message: 'Video uploaded and cataloged successfully',
      video,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    High performance HTTP 206 Partial Content video streaming endpoint
// @route   GET /api/videos/stream/:filename
export const streamVideo = (req, res) => {
  const { filename } = req.params;
  const videoPath = path.join(__dirname, '../../uploads/videos', filename);

  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ success: false, message: 'Video file not found' });
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
};

// @desc    Get all videos uploaded by user or catalog
// @route   GET /api/videos
export const getAllVideos = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'teacher') {
      query.uploadedBy = req.user._id;
    }
    const videos = await Video.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: videos.length, videos });
  } catch (error) {
    next(error);
  }
};
