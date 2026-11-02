import Assignment from '../models/Assignment.js';
import Course from '../models/Course.js';

// @desc    Get assignments for a course
// @route   GET /api/assignments
export const getAssignments = async (req, res, next) => {
  try {
    const { courseId } = req.query;
    let query = {};
    if (courseId) query.course = courseId;

    const assignments = await Assignment.find(query)
      .populate('course', 'title category')
      .populate('instructor', 'name avatar')
      .sort({ dueDate: 1 });

    res.json({ success: true, count: assignments.length, assignments });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new assignment (Teacher/Admin)
// @route   POST /api/assignments
export const createAssignment = async (req, res, next) => {
  try {
    const { title, courseId, description, instructions, dueDate, maxScore } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const assignment = await Assignment.create({
      title,
      course: courseId,
      instructor: req.user._id,
      description,
      instructions: instructions || '',
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 3600 * 1000),
      maxScore: maxScore || 100,
    });

    res.status(201).json({ success: true, assignment, message: 'Assignment created successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit assignment (Student)
// @route   POST /api/assignments/:id/submit
export const submitAssignment = async (req, res, next) => {
  try {
    const { content, attachmentUrl } = req.body;
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const studentId = req.user._id;
    const existingIndex = assignment.submissions.findIndex(
      (s) => s.student.toString() === studentId.toString()
    );

    const submissionData = {
      student: studentId,
      content: content || '',
      attachmentUrl: attachmentUrl || '',
      submittedAt: new Date(),
      status: new Date() > assignment.dueDate ? 'late' : 'submitted',
    };

    if (existingIndex > -1) {
      assignment.submissions[existingIndex] = {
        ...assignment.submissions[existingIndex].toObject(),
        ...submissionData,
      };
    } else {
      assignment.submissions.push(submissionData);
    }

    await assignment.save();

    res.status(201).json({ success: true, message: 'Assignment submitted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Grade submission (Teacher/Admin)
// @route   PUT /api/assignments/:id/grade
export const gradeSubmission = async (req, res, next) => {
  try {
    const { studentId, grade, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const sub = assignment.submissions.find(
      (s) => s.student.toString() === studentId.toString()
    );

    if (!sub) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    sub.grade = grade;
    sub.feedback = feedback || '';
    sub.status = 'graded';

    await assignment.save();

    res.json({ success: true, message: 'Submission graded successfully' });
  } catch (error) {
    next(error);
  }
};
