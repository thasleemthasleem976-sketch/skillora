import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';

// @desc    Get all courses with optional search, category, level
// @route   GET /api/courses
export const getAllCourses = async (req, res, next) => {
  try {
    const { search, category, level } = req.query;
    let filter = { status: 'published' };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (level && level !== 'All') {
      filter.level = level;
    }

    const courses = await Course.find(filter)
      .populate('instructor', 'name email avatar headline')
      .populate('lessons', 'title durationMinutes isFreePreview order')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: courses.length, courses });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course details
// @route   GET /api/courses/:id
export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email avatar bio headline')
      .populate({
        path: 'lessons',
        options: { sort: { order: 1 } },
        populate: { path: 'video', select: 'title duration url format' },
      });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new course (Teacher/Admin)
// @route   POST /api/courses
export const createCourse = async (req, res, next) => {
  try {
    const { title, subtitle, description, category, level, price, thumbnail, tags } = req.body;

    const course = await Course.create({
      title,
      subtitle: subtitle || '',
      description,
      category: category || 'Technology',
      level: level || 'Beginner',
      price: price || 0,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
      tags: tags || ['Education', 'Tech'],
      instructor: req.user._id,
      status: 'published',
    });

    res.status(201).json({ success: true, course, message: 'Course created successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
export const updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this course' });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, course, message: 'Course updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this course' });
    }

    await Lesson.deleteMany({ courseId: course._id });
    await Course.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Course and associated lessons deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get courses created by current teacher (or all courses for admin)
// @route   GET /api/courses/teacher/my-courses
export const getTeacherCourses = async (req, res, next) => {
  try {
    let query = { instructor: req.user._id };
    if (req.user.role === 'admin') {
      query = {}; // Admin manages all courses
    }
    const courses = await Course.find(query)
      .populate('instructor', 'name email avatar headline')
      .populate('lessons')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: courses.length, courses });
  } catch (error) {
    next(error);
  }
};
