import express from 'express';
import {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuizAttempt,
} from '../controllers/quizController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getQuizzes);
router.get('/:id', getQuizById);
router.post('/', authorize('teacher', 'admin'), createQuiz);
router.put('/:id', authorize('teacher', 'admin'), updateQuiz);
router.delete('/:id', authorize('teacher', 'admin'), deleteQuiz);
router.post('/:id/submit', submitQuizAttempt);

export default router;
