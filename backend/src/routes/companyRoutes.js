import express from 'express';
import {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../controllers/companyController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createCompanySchema, updateCompanySchema } from '../validators/placementValidators.js';

const router = express.Router();

router.use(protect);

router.get('/', getCompanies);
router.get('/:id', getCompanyById);
router.post('/', authorize('admin'), validate(createCompanySchema), createCompany);
router.put('/:id', authorize('admin'), validate(updateCompanySchema), updateCompany);
router.delete('/:id', authorize('admin'), deleteCompany);

export default router;

