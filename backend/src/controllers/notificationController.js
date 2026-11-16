import { Notification } from '../models/Notification.js';
import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import { ActivityLog } from '../models/ActivityLog.js';

// @desc    Get current user's notifications (direct + role broadcast) with optional type & search filters
// @route   GET /api/notifications
// @access  Private (Authenticated)
export const getMyNotifications = async (req, res, next) => {
  try {
    const { type, unreadOnly, search } = req.query;

    const baseFilter = {
      $or: [
        { recipientId: req.user._id },
        { recipientId: null, recipientRole: { $in: [req.user.role, 'all'] } },
      ],
    };

    if (type && type !== 'All' && type !== 'all') {
      baseFilter.type = type;
    }

    if (unreadOnly === 'true' || unreadOnly === true) {
      baseFilter.read = false;
    }

    if (search && search.trim()) {
      const q = search.trim();
      baseFilter.$and = [
        {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { message: { $regex: q, $options: 'i' } },
          ],
        },
      ];
    }

    const notifications = await Notification.find(baseFilter)
      .sort({ createdAt: -1 })
      .limit(100);

    // Calculate unread count for the user
    const unreadFilter = {
      $or: [
        { recipientId: req.user._id },
        { recipientId: null, recipientRole: { $in: [req.user.role, 'all'] } },
      ],
      read: false,
    };
    const unreadCount = await Notification.countDocuments(unreadFilter);

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quick unread notifications count (for Navbar badge)
// @route   GET /api/notifications/unread-count
// @access  Private (Authenticated)
export const getUnreadCount = async (req, res, next) => {
  try {
    const unreadFilter = {
      $or: [
        { recipientId: req.user._id },
        { recipientId: null, recipientRole: { $in: [req.user.role, 'all'] } },
      ],
      read: false,
    };

    const unreadCount = await Notification.countDocuments(unreadFilter);

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all broadcast history with delivery telemetry
// @route   GET /api/notifications/all-broadcasts
// @access  Private (Admin)
export const getAllBroadcasts = async (req, res, next) => {
  try {
    const { type, search } = req.query;
    const query = {};

    if (type && type !== 'All') {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const broadcasts = await Notification.find(query)
      .populate('recipientId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(150);

    res.status(200).json({
      success: true,
      count: broadcasts.length,
      data: broadcasts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private (Authenticated)
export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all user notifications as read
// @route   PATCH /api/notifications/mark-all-read
// @access  Private (Authenticated)
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const filter = {
      $or: [
        { recipientId: req.user._id },
        { recipientId: null, recipientRole: { $in: [req.user.role, 'all'] } },
      ],
      read: false,
    };

    const updateResult = await Notification.updateMany(filter, {
      $set: { read: true, readAt: new Date() },
    });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: updateResult.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Dispatch broadcast or targeted notification with multi-channel simulation
// @route   POST /api/notifications
// @access  Private (Admin)
export const createNotification = async (req, res, next) => {
  try {
    const {
      recipientId,
      recipientRole,
      title,
      message,
      type,
      priority,
      targetBranch,
      targetBatch,
      channels,
      scheduledFor,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required for notification dispatch.',
      });
    }

    const selectedChannels = Array.isArray(channels) && channels.length > 0
      ? channels
      : ['in-app', 'email'];

    // Estimate recipient audience count
    let estimatedCount = 1;
    if (!recipientId) {
      if (recipientRole === 'student') {
        const studentQuery = {};
        if (targetBranch && targetBranch !== 'All') studentQuery.branch = targetBranch;
        if (targetBatch) studentQuery.batch = targetBatch;
        estimatedCount = (await Student.countDocuments(studentQuery)) || 180;
      } else if (recipientRole === 'admin') {
        estimatedCount = (await User.countDocuments({ role: 'admin' })) || 5;
      } else {
        estimatedCount = (await User.countDocuments()) || 250;
      }
    }

    // Build multi-channel simulated delivery receipts
    const deliveryReceipts = {
      inApp: {
        delivered: true,
        deliveredAt: new Date(),
      },
      email: {
        simulated: true,
        delivered: selectedChannels.includes('email'),
        recipientCount: selectedChannels.includes('email') ? estimatedCount : 0,
        sentAt: selectedChannels.includes('email') ? new Date() : null,
      },
      sms: {
        simulated: true,
        delivered: selectedChannels.includes('sms'),
        recipientCount: selectedChannels.includes('sms') ? estimatedCount : 0,
        sentAt: selectedChannels.includes('sms') ? new Date() : null,
      },
    };

    const notification = await Notification.create({
      recipientId: recipientId || null,
      recipientRole: recipientRole || 'all',
      title: title.trim(),
      message: message.trim(),
      type: type || 'Announcement',
      priority: priority || 'Normal',
      targetBranch: targetBranch || 'All',
      targetBatch: targetBatch || '2026',
      channels: selectedChannels,
      deliveryStatus: 'Delivered',
      deliveryReceipts,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
    });

    // Log administrative activity
    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: `Broadcasted Notice: ${notification.title}`,
      entityType: 'Notification',
      entityId: notification._id.toString(),
      details: {
        recipientRole: notification.recipientRole,
        type: notification.type,
        priority: notification.priority,
        channels: selectedChannels,
        recipientCount: estimatedCount,
      },
    });

    res.status(201).json({
      success: true,
      message: `Notification broadcast dispatched to ${estimatedCount} recipients across [${selectedChannels.join(', ')}]`,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Retract/delete an announcement
// @route   DELETE /api/notifications/:id
// @access  Private (Admin)
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    await Notification.findByIdAndDelete(req.params.id);

    // Log activity
    await ActivityLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      action: `Retracted Notice: ${notification.title}`,
      entityType: 'Notification',
      entityId: req.params.id,
      details: { title: notification.title },
    });

    res.status(200).json({
      success: true,
      message: 'Notification successfully retracted from communication stream',
    });
  } catch (error) {
    next(error);
  }
};
