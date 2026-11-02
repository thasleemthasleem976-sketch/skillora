import express from 'express';
import {
  logProctoringEvent,
  getProctoringLogsByExam,
  getAllProctoringLogs,
} from '../controllers/proctoringController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/log', logProctoringEvent);
router.get('/exam/:examId', authorize('teacher', 'admin'), getProctoringLogsByExam);
router.get('/all', authorize('admin'), getAllProctoringLogs);

export default router;
