import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';
import Video from '../models/Video.js';

// @desc    Create a new lesson for a course
// @route   POST /api/lessons
export const createLesson = async (req, res, next) => {
  try {
    const { courseId, title, description, order, durationMinutes, videoId, videoUrl, isFreePreview, resources } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to add lessons to this course' });
    }

    let finalVideoUrl = videoUrl || '';
    if (videoId) {
      const vid = await Video.findById(videoId);
      if (vid) {
        finalVideoUrl = vid.url;
      }
    }

    const lesson = await Lesson.create({
      courseId,
      title,
      description: description || '',
      order: order || course.lessons.length + 1,
      durationMinutes: durationMinutes || 10,
      video: videoId || null,
      videoUrl: finalVideoUrl,
      isFreePreview: isFreePreview || false,
      resources: resources || [],
    });

    course.lessons.push(lesson._id);
    await course.save();

    res.status(201).json({ success: true, lesson, message: 'Lesson created successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lesson
// @route   PUT /api/lessons/:id
export const updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const updated = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, lesson: updated, message: 'Lesson updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
export const deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    await Course.findByIdAndUpdate(lesson.courseId, {
      $pull: { lessons: lesson._id },
    });

    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Lesson deleted successfully' });
  } catch (error) {
    next(error);
  }
};
