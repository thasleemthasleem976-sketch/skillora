import express from 'express';
import {
  getLiveClasses,
  getLiveClassById,
  createLiveClass,
  updateLiveClassStatus,
  recordAttendance,
} from '../controllers/liveClassController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getLiveClasses);
router.get('/:id', getLiveClassById);
router.post('/', authorize('teacher', 'admin'), createLiveClass);
router.put('/:id/status', authorize('teacher', 'admin'), updateLiveClassStatus);
router.post('/:id/attendance', recordAttendance);

export default router;
