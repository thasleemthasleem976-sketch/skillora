import express from 'express';
import { uploadVideoFile, streamVideo, getAllVideos } from '../controllers/videoController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadVideo } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public streaming route for video players (supports HTTP 206 Partial Content)
router.get('/stream/:filename', streamVideo);

// Protected video management
router.get('/', protect, getAllVideos);
router.post(
  '/upload',
  protect,
  authorize('teacher', 'admin'),
  uploadVideo.single('video'),
  uploadVideoFile
);

export default router;
