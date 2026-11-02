import express from 'express';
import {
  getAllExams,
  getExamForStudent,
  getExamById,
  createExam,
  submitExam,
  getExamResultById,
  getMyExamResults,
  getExamResultsForTeacher,
} from '../controllers/examController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAllExams);
router.get('/my-results', getMyExamResults);
router.get('/result/:resultId', getExamResultById);
router.get('/:id/take', getExamForStudent);
router.post('/:id/submit', submitExam);

// Teacher/Admin routes
router.get('/:id', authorize('teacher', 'admin'), getExamById);
router.get('/:id/results', authorize('teacher', 'admin'), getExamResultsForTeacher);
router.post('/', authorize('teacher', 'admin'), createExam);

export default router;
