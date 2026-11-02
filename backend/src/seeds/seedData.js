import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Video from '../models/Video.js';
import Enrollment from '../models/Enrollment.js';
import Assignment from '../models/Assignment.js';
import Quiz from '../models/Quiz.js';
import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import ExamResult from '../models/ExamResult.js';
import ProctoringLog from '../models/ProctoringLog.js';
import LiveClass from '../models/LiveClass.js';
import Notification from '../models/Notification.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillora_lms');
    console.log('[Seed] Connected to MongoDB.');

    // Clear all existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Video.deleteMany({});
    await Enrollment.deleteMany({});
    await Assignment.deleteMany({});
    await Quiz.deleteMany({});
    await Exam.deleteMany({});
    await Question.deleteMany({});
    await ExamResult.deleteMany({});
    await ProctoringLog.deleteMany({});
    await LiveClass.deleteMany({});
    await Notification.deleteMany({});

    console.log('[Seed] Cleared all sample data.');

    // Create the exact 3 Sample Login Accounts
    await User.create({
      name: 'Admin User',
      email: 'admin@skillora.edu',
      password: 'Password@123',
      role: 'admin',
      headline: 'Platform Administrator',
      bio: 'Administrator account for curriculum creation and examination oversight.',
    });

    await User.create({
      name: 'Teacher User',
      email: 'teacher@skillora.edu',
      password: 'Password@123',
      role: 'teacher',
      headline: 'Lead Instructor',
      bio: 'Instructor account for publishing courses and scheduling live classes.',
    });

    await User.create({
      name: 'Student User',
      email: 'student@skillora.edu',
      password: 'Password@123',
      role: 'student',
      headline: 'Enrolled Student',
      bio: 'Student account for taking exams and attending live sessions.',
    });

    console.log('[Seed] Ready: 3 sample login accounts created. All sample data cleared.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seed();
