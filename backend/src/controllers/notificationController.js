import Notification from '../models/Notification.js';

// @desc    Get user notifications
// @route   GET /api/notifications
export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({ success: true, unreadCount, notifications });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    res.json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
