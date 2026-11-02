import express from 'express';
import { createLesson, updateLesson, deleteLesson } from '../controllers/lessonController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('teacher', 'admin'), createLesson);
router.put('/:id', protect, authorize('teacher', 'admin'), updateLesson);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteLesson);

export default router;
