import express from 'express';
import {
  getApplications,
  getApplicationById,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { updateApplicationStatusSchema } from '../validators/placementValidators.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin'), getApplications);
router.get('/:id', getApplicationById);
router.patch(
  '/:id/status',
  authorize('admin'),
  validate(updateApplicationStatusSchema),
  updateApplicationStatus
);

export default router;

