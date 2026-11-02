import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'skillora_super_secret_jwt_key_2026_edtech_proctor',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, bio, headline } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const assignedRole = ['student', 'teacher', 'admin'].includes(role) ? role : 'student';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      bio: bio || '',
      headline: headline || (assignedRole === 'teacher' ? 'Instructor & Subject Specialist' : 'Lifelong Learner'),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        headline: user.headline,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended by administration.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        headline: user.headline,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, headline, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (headline !== undefined) user.headline = headline;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      user,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};
