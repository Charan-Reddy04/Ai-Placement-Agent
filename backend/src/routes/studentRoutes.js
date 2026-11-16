import express from 'express';
import {
  getMyProfile,
  updateMyProfile,
  uploadResume,
  getMyApplications,
  getMyInterviews,
  getAllStudents,
  getStudentById,
} from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { updateStudentProfileSchema } from '../validators/placementValidators.js';
import { resumeUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All student routes require authentication
router.use(protect);

// Student self routes
router.get('/me', getMyProfile);
router.put('/me', validate(updateStudentProfileSchema), updateMyProfile);
router.post('/me/resume', resumeUpload.single('resume'), uploadResume);
router.get('/me/applications', getMyApplications);
router.get('/me/interviews', getMyInterviews);

// Admin-only candidate directory routes
router.get('/', authorize('admin'), getAllStudents);
router.get('/:id', authorize('admin'), getStudentById);

export default router;

