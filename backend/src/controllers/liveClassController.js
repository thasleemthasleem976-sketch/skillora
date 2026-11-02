import LiveClass from '../models/LiveClass.js';
import Course from '../models/Course.js';
import { v4 as uuidv4 } from 'uuid';

// @desc    Get upcoming & live classes (optionally filtered by course)
// @route   GET /api/live-classes
export const getLiveClasses = async (req, res, next) => {
  try {
    const { courseId } = req.query;
    let query = {};
    if (courseId) query.course = courseId;

    const liveClasses = await LiveClass.find(query)
      .populate('course', 'title category thumbnail')
      .populate('instructor', 'name avatar email')
      .sort({ scheduledStartTime: 1 });

    res.json({ success: true, count: liveClasses.length, liveClasses });
  } catch (error) {
    next(error);
  }
};

// @desc    Get live class by ID / Room ID
// @route   GET /api/live-classes/:id
export const getLiveClassById = async (req, res, next) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id)
      .populate('course', 'title category')
      .populate('instructor', 'name avatar bio headline')
      .populate('attendance.student', 'name email avatar');

    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class session not found' });
    }

    res.json({ success: true, liveClass });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule a live class (Teacher/Admin)
// @route   POST /api/live-classes
export const createLiveClass = async (req, res, next) => {
  try {
    const { title, courseId, description, scheduledStartTime, durationMinutes } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const roomId = 'room-' + uuidv4().slice(0, 8);

    const liveClass = await LiveClass.create({
      title,
      course: courseId,
      instructor: req.user._id,
      description: description || '',
      scheduledStartTime: scheduledStartTime || new Date(Date.now() + 3600000),
      durationMinutes: durationMinutes || 60,
      roomId,
      status: 'scheduled',
    });

    res.status(201).json({
      success: true,
      message: 'Live class scheduled successfully',
      liveClass,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update live class status (start session / end session)
// @route   PUT /api/live-classes/:id/status
export const updateLiveClassStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const liveClass = await LiveClass.findById(req.params.id);

    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    if (liveClass.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only session instructor can alter status' });
    }

    liveClass.status = status;
    await liveClass.save();

    res.json({ success: true, liveClass, message: `Live class status marked as ${status}` });
  } catch (error) {
    next(error);
  }
};

// @desc    Track student attendance (join / leave)
// @route   POST /api/live-classes/:id/attendance
export const recordAttendance = async (req, res, next) => {
  try {
    const { action } = req.body; // 'join' or 'leave'
    const studentId = req.user._id;

    const liveClass = await LiveClass.findById(req.params.id);
    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    let attendee = liveClass.attendance.find(
      (a) => a.student.toString() === studentId.toString()
    );

    if (action === 'join') {
      if (!attendee) {
        liveClass.attendance.push({
          student: studentId,
          joinedAt: new Date(),
        });
      }
    } else if (action === 'leave' && attendee) {
      attendee.leftAt = new Date();
      if (attendee.joinedAt) {
        const diffMs = attendee.leftAt.getTime() - attendee.joinedAt.getTime();
        attendee.durationMinutes = Math.round(diffMs / (1000 * 60));
      }
    }

    await liveClass.save();

    res.json({ success: true, message: `Attendance ${action} recorded` });
  } catch (error) {
    next(error);
  }
};
