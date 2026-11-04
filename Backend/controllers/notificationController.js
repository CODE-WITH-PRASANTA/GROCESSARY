// controllers/notificationController.js
const mongoose = require("mongoose");
const Notification = require("../models/Notification");

// ======================================================
// GET /api/notifications
// Returns notifications + unread count for the logged-in user
// ======================================================
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 50 } = req.query;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .lean(),
      Notification.countDocuments({ user: userId, isRead: false }),
    ]);

    return res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (err) {
    console.error("getNotifications error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load notifications.",
    });
  }
};

// ======================================================
// GET /api/notifications/unread-count
// ======================================================
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });
    return res.json({ success: true, unreadCount: count });
  } catch (err) {
    console.error("getUnreadCount error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load unread count.",
    });
  }
};

// ======================================================
// PUT /api/notifications/:id/read
// Mark one notification read
// ======================================================
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification id.",
      });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.json({
      success: true,
      notification,
    });
  } catch (err) {
    console.error("markAsRead error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to mark as read.",
    });
  }
};

// ======================================================
// PUT /api/notifications/read-all
// Mark every notification for this user as read
// ======================================================
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return res.json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (err) {
    console.error("markAllAsRead error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to mark all as read.",
    });
  }
};

// ======================================================
// DELETE /api/notifications/:id
// ======================================================
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification id.",
      });
    }

    const deleted = await Notification.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.json({
      success: true,
      message: "Notification deleted.",
    });
  } catch (err) {
    console.error("deleteNotification error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete notification.",
    });
  }
};

// ======================================================
// Helper — create a notification (call from other controllers)
// ======================================================
exports.createNotification = async ({
  userId,
  title,
  message = "",
  type = "general",
  link = "",
  meta = {},
}) => {
  try {
    if (!userId || !title) return null;
    return await Notification.create({
      user: userId,
      title,
      message,
      type,
      link,
      meta,
    });
  } catch (err) {
    console.error("createNotification error:", err);
    return null;
  }
};