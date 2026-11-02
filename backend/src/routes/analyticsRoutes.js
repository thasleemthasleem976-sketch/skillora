import express from 'express';
import { getTeacherAnalytics, getAdminAnalytics } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/teacher', authorize('teacher', 'admin'), getTeacherAnalytics);
router.get('/admin', authorize('admin'), getAdminAnalytics);

export default router;
