import ProctoringLog from '../models/ProctoringLog.js';
import Exam from '../models/Exam.js';
import { getSocketIO } from '../services/socketService.js';

// @desc    Log a proctoring event from client (Face detection, tab switch, movement)
// @route   POST /api/proctoring/log
export const logProctoringEvent = async (req, res, next) => {
  try {
    const { examId, eventType, message, severity, metaData } = req.body;
    const studentId = req.user._id;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    const logEntry = await ProctoringLog.create({
      student: studentId,
      exam: examId,
      eventType: eventType || 'SUSPICIOUS_HEAD_MOVEMENT',
      severity: severity || 'warning',
      message: message || 'Proctoring alert generated',
      metaData: metaData || {},
      timestamp: new Date(),
    });

    // Real-time notification to instructor room via Socket.io
    const io = getSocketIO();
    if (io) {
      io.to(`exam-proctoring-${examId}`).emit('proctoring-alert', {
        studentId,
        studentName: req.user.name,
        eventType,
        message,
        severity,
        timestamp: logEntry.timestamp,
      });
    }

    res.status(201).json({
      success: true,
      log: logEntry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get proctoring logs for an exam (Teacher/Admin)
// @route   GET /api/proctoring/exam/:examId
export const getProctoringLogsByExam = async (req, res, next) => {
  try {
    const { studentId } = req.query;
    let query = { exam: req.params.examId };

    if (studentId) {
      query.student = studentId;
    }

    const logs = await ProctoringLog.find(query)
      .populate('student', 'name email avatar')
      .sort({ timestamp: -1 })
      .limit(200);

    // Summary statistics
    const eventCounts = {
      FACE_NOT_DETECTED: 0,
      MULTIPLE_FACES_DETECTED: 0,
      TAB_WINDOW_SWITCH: 0,
      SUSPICIOUS_HEAD_MOVEMENT: 0,
      FULLSCREEN_EXITED: 0,
    };

    logs.forEach((log) => {
      if (eventCounts[log.eventType] !== undefined) {
        eventCounts[log.eventType] += 1;
      }
    });

    res.json({
      success: true,
      count: logs.length,
      eventCounts,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all proctoring logs across platform (Admin)
// @route   GET /api/proctoring/all
export const getAllProctoringLogs = async (req, res, next) => {
  try {
    const logs = await ProctoringLog.find()
      .populate('student', 'name email avatar')
      .populate('exam', 'title durationMinutes')
      .sort({ timestamp: -1 })
      .limit(100);

    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    next(error);
  }
};
