import express from 'express';
import {
  postAdminAgentMessage,
  getAgentTasks,
  getAgentTaskById,
  approveTask,
  rejectTask,
  postStudentCareerMessage,
  postAnalyzeJobDescription,
  postAiSkillMatch,
} from '../controllers/agentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

// Admin AI Placement Agent endpoints
router.post('/admin-chat', authorize('admin'), postAdminAgentMessage);
router.post('/analyze-jd', authorize('admin'), postAnalyzeJobDescription);
router.post('/ai-skill-match', authorize('admin'), postAiSkillMatch);
router.get('/tasks', authorize('admin'), getAgentTasks);
router.get('/tasks/:id', authorize('admin'), getAgentTaskById);
router.post('/tasks/:id/approve', authorize('admin'), approveTask);
router.post('/tasks/:id/reject', authorize('admin'), rejectTask);

// Student AI Career Assistant endpoint
router.post('/student-chat', authorize('student'), postStudentCareerMessage);

export default router;

