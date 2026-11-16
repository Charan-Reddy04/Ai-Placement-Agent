import express from 'express';
import {
  getInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  updateInterviewStatus,
  deleteInterview,
  checkConflict,
  getPanels,
  getPanelById,
  createPanel,
  updatePanel,
  deletePanel,
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
} from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

// Panel routes
router.get('/panels', getPanels);
router.get('/panels/:id', getPanelById);
router.post('/panels', authorize('admin'), createPanel);
router.put('/panels/:id', authorize('admin'), updatePanel);
router.delete('/panels/:id', authorize('admin'), deletePanel);

// Venue routes
router.get('/venues', getVenues);
router.get('/venues/:id', getVenueById);
router.post('/venues', authorize('admin'), createVenue);
router.put('/venues/:id', authorize('admin'), updateVenue);
router.delete('/venues/:id', authorize('admin'), deleteVenue);

// Conflict check
router.post('/check-conflict', authorize('admin'), checkConflict);

// Main interview routes
router.get('/', getInterviews);
router.post('/', authorize('admin'), createInterview);
router.get('/:id', getInterviewById);
router.put('/:id', authorize('admin'), updateInterview);
router.patch('/:id/status', authorize('admin'), updateInterviewStatus);
router.delete('/:id', authorize('admin'), deleteInterview);

export default router;
