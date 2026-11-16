import { AgentTask } from '../models/AgentTask.js';
import { agentOrchestrator } from '../services/agentOrchestrator.js';
import { agentTools } from '../services/agentTools.js';

// @desc    Admin: Send query/instruction to AI Placement Agent
// @route   POST /api/agent/admin-chat
// @access  Private (Admin)
export const postAdminAgentMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide an administrative query or placement instruction.',
      });
    }

    const result = await agentOrchestrator.orchestrateAdminRequest({
      request: message,
      adminUser: req.user,
    });

    res.status(200).json({
      success: true,
      message: result.message,
      task: result.task,
      toolResult: result.toolResult,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all agent tasks & approval queue
// @route   GET /api/agent/tasks
// @access  Private (Admin)
export const getAgentTasks = async (req, res, next) => {
  try {
    const tasks = await AgentTask.find()
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get single task detail
// @route   GET /api/agent/tasks/:id
// @access  Private (Admin)
export const getAgentTaskById = async (req, res, next) => {
  try {
    const task = await AgentTask.findById(req.params.id)
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Agent task not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Approve and execute agent proposal (Human-in-the-loop gate)
// @route   POST /api/agent/tasks/:id/approve
// @access  Private (Admin)
export const approveTask = async (req, res, next) => {
  try {
    const result = await agentOrchestrator.approveTaskAction({
      taskId: req.params.id,
      adminUser: req.user,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Reject agent proposal
// @route   POST /api/agent/tasks/:id/reject
// @access  Private (Admin)
export const rejectTask = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const result = await agentOrchestrator.rejectTaskAction({
      taskId: req.params.id,
      adminUser: req.user,
      reason,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Student: Interactive AI Career Assistant chat
// @route   POST /api/agent/student-chat
// @access  Private (Student)
export const postStudentCareerMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a question or career topic.',
      });
    }

    const result = await agentOrchestrator.studentCareerAssistant({
      message,
      studentUser: req.user,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Analyze raw Job Description text with AI & ontology heuristics
// @route   POST /api/agent/analyze-jd
// @access  Private (Admin)
export const postAnalyzeJobDescription = async (req, res, next) => {
  try {
    const { jdText } = req.body;
    if (!jdText || jdText.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide job description text to analyze.',
      });
    }

    const result = await agentTools.analyzeJobDescription({ jdText });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Perform semantic AI skill matching for candidates using Real LLM
// @route   POST /api/agent/ai-skill-match
// @access  Private (Admin)
export const postAiSkillMatch = async (req, res, next) => {
  try {
    const { studentId, jobId, candidates, job } = req.body;
    if (!jobId && !job) {
      return res.status(400).json({
        success: false,
        message: 'Please provide target jobId or job object for AI matching.',
      });
    }

    const result = await agentTools.matchCandidateSkillsWithAI({
      studentId,
      jobId,
      candidates,
      job,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

