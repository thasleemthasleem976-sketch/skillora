import express from 'express';
import {
  getAssignments,
  createAssignment,
  submitAssignment,
  gradeSubmission,
} from '../controllers/assignmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAssignments);
router.post('/', authorize('teacher', 'admin'), createAssignment);
router.post('/:id/submit', submitAssignment);
router.put('/:id/grade', authorize('teacher', 'admin'), gradeSubmission);

export default router;
