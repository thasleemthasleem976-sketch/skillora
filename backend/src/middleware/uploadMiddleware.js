import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const videoUploadDir = path.join(__dirname, '../../uploads/videos');
const imageUploadDir = path.join(__dirname, '../../uploads/thumbnails');

if (!fs.existsSync(videoUploadDir)) {
  fs.mkdirSync(videoUploadDir, { recursive: true });
}
if (!fs.existsSync(imageUploadDir)) {
  fs.mkdirSync(imageUploadDir, { recursive: true });
}

// Storage for videos
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videoUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Storage for images / general files
const generalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imageUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'asset-' + uniqueSuffix + path.extname(file.originalname));
  },
});

export const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
  fileFilter: (req, file, cb) => {
    const filetypes = /mp4|mkv|webm|avi|mov/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('video/');
    if (extname || mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only video files (mp4, webm, mov, mkv) are allowed!'));
  },
});

export const uploadImage = multer({
  storage: generalStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|svg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('image/');
    if (extname || mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed!'));
  },
});
