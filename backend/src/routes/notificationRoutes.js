import express from 'express';
import {
  getMyNotifications,
  getUnreadCount,
  getAllBroadcasts,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification,
  deleteNotification,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.get('/all-broadcasts', authorize('admin'), getAllBroadcasts);
router.patch('/mark-all-read', markAllNotificationsRead);
router.patch('/:id/read', markNotificationRead);
router.post('/', authorize('admin'), createNotification);
router.delete('/:id', authorize('admin'), deleteNotification);

export default router;
