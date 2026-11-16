import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getMe, logout, getSetupStatus, bootstrapAdmin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { registerStudentSchema, loginSchema } from '../validators/authValidators.js';

const router = express.Router();

// Stricter rate limiter for authentication attempts (prevents brute-force)
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // 30 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 10 minutes.',
  },
});

router.get('/setup-status', getSetupStatus);
router.post('/bootstrap-admin', authLimiter, bootstrapAdmin);
router.post('/register', authLimiter, validate(registerStudentSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;

