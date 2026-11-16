import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null, // null denotes role-based broadcast or targeted group
    },
    recipientRole: {
      type: String,
      enum: ['student', 'admin', 'all'],
      default: 'all',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Announcement', 'Interview', 'Application', 'Alert', 'System'],
      default: 'Announcement',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Normal', 'High', 'Urgent'],
      default: 'Normal',
      index: true,
    },
    targetBranch: {
      type: String,
      default: 'All',
    },
    targetBatch: {
      type: String,
      default: '2026',
    },
    channels: [
      {
        type: String,
        enum: ['in-app', 'email', 'sms'],
        default: 'in-app',
      },
    ],
    deliveryStatus: {
      type: String,
      enum: ['Pending', 'Delivered', 'Failed'],
      default: 'Delivered',
      index: true,
    },
    deliveryReceipts: {
      inApp: {
        delivered: { type: Boolean, default: true },
        deliveredAt: { type: Date, default: Date.now },
      },
      email: {
        simulated: { type: Boolean, default: true },
        delivered: { type: Boolean, default: true },
        recipientCount: { type: Number, default: 0 },
        sentAt: { type: Date, default: Date.now },
      },
      sms: {
        simulated: { type: Boolean, default: true },
        delivered: { type: Boolean, default: false },
        recipientCount: { type: Number, default: 0 },
        sentAt: { type: Date, default: null },
      },
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    scheduledFor: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipientId: 1, read: 1 });
notificationSchema.index({ recipientRole: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
