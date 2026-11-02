import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { initQueues } from './services/queueService.js';
import { initSocket } from './services/socketService.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import examRoutes from './routes/examRoutes.js';
import proctoringRoutes from './routes/proctoringRoutes.js';
import liveClassRoutes from './routes/liveClassRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);

// Connect to MongoDB
connectDB();

// Initialize BullMQ Queues (with in-memory fallback)
initQueues();

// Initialize Real-time Socket.io & WebRTC signaling
initSocket(httpServer);

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static directories for videos and uploaded thumbnails
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Skillora LMS Backend',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/proctoring', proctoringRoutes);
app.use('/api/live-classes', liveClassRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🎓 Skillora LMS API running on port ${PORT}`);
  console.log(`📡 Realtime WebRTC & Socket.io Signaling Active`);
  console.log(`🛡️ Automated Proctoring Engine Ready`);
  console.log(`🎥 Video Streaming Gateway: http://localhost:${PORT}/api/videos/stream/:id`);
  console.log(`====================================================`);
});
