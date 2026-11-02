import express from 'express';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getTeacherCourses,
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllCourses);
router.get('/teacher/my-courses', protect, authorize('teacher', 'admin'), getTeacherCourses);
router.get('/:id', getCourseById);
router.post('/', protect, authorize('teacher', 'admin'), createCourse);
router.put('/:id', protect, authorize('teacher', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteCourse);

export default router;
