import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';

// @desc    Enroll in a course
// @route   POST /api/enrollments/enroll/:courseId
export const enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    let enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (enrollment) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      enrolledAt: new Date(),
      progressPercentage: 0,
      completedLessons: [],
      lastAccessedLesson: course.lessons[0] || null,
    });

    course.enrolledCount += 1;
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get enrolled courses for logged-in student
// @route   GET /api/enrollments/my-courses
export const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        populate: [
          { path: 'instructor', select: 'name email avatar headline' },
          { path: 'lessons', select: 'title durationMinutes order' },
        ],
      })
      .populate('lastAccessedLesson', 'title order durationMinutes')
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: enrollments.length, enrollments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get enrollment details for a specific course
// @route   GET /api/enrollments/course/:courseId
export const getCourseEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId,
    });

    res.json({
      success: true,
      isEnrolled: Boolean(enrollment),
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update video playback timestamp (resume video from previous position)
// @route   PUT /api/enrollments/video-progress
export const updateVideoProgress = async (req, res, next) => {
  try {
    const { courseId, lessonId, currentTime, duration } = req.body;
    const studentId = req.user._id;

    let enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment record not found' });
    }

    if (!enrollment.videoPlaybackState) {
      enrollment.videoPlaybackState = new Map();
    }

    enrollment.videoPlaybackState.set(lessonId.toString(), {
      currentTime: parseFloat(currentTime) || 0,
      duration: parseFloat(duration) || 0,
      lastUpdated: new Date(),
    });

    enrollment.lastAccessedLesson = lessonId;
    await enrollment.save();

    res.json({
      success: true,
      message: 'Video timestamp saved',
      savedTime: currentTime,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle or mark lesson completion and update progress percentage
// @route   PUT /api/enrollments/toggle-lesson
export const toggleLessonCompletion = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.body;
    const studentId = req.user._id;

    const course = await Course.findById(courseId);
    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    const lessonIndex = enrollment.completedLessons.findIndex(
      (id) => id.toString() === lessonId.toString()
    );

    if (lessonIndex > -1) {
      enrollment.completedLessons.splice(lessonIndex, 1);
    } else {
      enrollment.completedLessons.push(lessonId);
    }

    const totalLessons = course.lessons.length || 1;
    enrollment.progressPercentage = Math.round(
      (enrollment.completedLessons.length / totalLessons) * 100
    );
    enrollment.lastAccessedLesson = lessonId;

    await enrollment.save();

    res.json({
      success: true,
      progressPercentage: enrollment.progressPercentage,
      completedLessons: enrollment.completedLessons,
    });
  } catch (error) {
    next(error);
  }
};
