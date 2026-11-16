import express from 'express';
import {
  getDashboardStats,
  getDetailedAnalytics,
  exportPlacementCSV,
  deleteActivityLog,
  clearAllActivities,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard-stats', getDashboardStats);
router.get('/detailed', authorize('admin'), getDetailedAnalytics);
router.get('/export/csv', authorize('admin'), exportPlacementCSV);
router.delete('/activity/:id', authorize('admin'), deleteActivityLog);
router.delete('/activities', authorize('admin'), clearAllActivities);

export default router;
