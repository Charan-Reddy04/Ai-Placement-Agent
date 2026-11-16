import express from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  updateJobStatus,
  checkJobEligibility,
} from '../controllers/jobController.js';
import { applyToJob } from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import {
  createJobSchema,
  updateJobSchema,
  updateJobStatusSchema,
} from '../validators/placementValidators.js';

const router = express.Router();

router.use(protect);

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/:id/check-eligibility', checkJobEligibility);
router.post('/:id/apply', authorize('student'), applyToJob);

// Admin-only management
router.post('/', authorize('admin'), validate(createJobSchema), createJob);
router.put('/:id', authorize('admin'), validate(updateJobSchema), updateJob);
router.patch('/:id/status', authorize('admin'), validate(updateJobStatusSchema), updateJobStatus);

export default router;

