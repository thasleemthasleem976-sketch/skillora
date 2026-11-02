import express from 'express';
import {
  enrollInCourse,
  getMyEnrollments,
  getCourseEnrollment,
  updateVideoProgress,
  toggleLessonCompletion,
} from '../controllers/enrollmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/enroll/:courseId', enrollInCourse);
router.get('/my-courses', getMyEnrollments);
router.get('/course/:courseId', getCourseEnrollment);
router.put('/video-progress', updateVideoProgress);
router.put('/toggle-lesson', toggleLessonCompletion);

export default router;
