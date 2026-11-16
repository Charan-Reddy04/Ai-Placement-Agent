import api from './api';

export const agentService = {
  // Admin AI Placement Agent chat
  sendAdminMessage: async (message) => {
    const response = await api.post('/agent/admin-chat', { message });
    return response.data;
  },

  // Admin AI Job Description Analyzer (extracts structured recruitment parameters)
  analyzeJD: async (jdText) => {
    const response = await api.post('/agent/analyze-jd', { jdText });
    return response.data;
  },

  // Get agent tasks & approval queue
  getTasks: async () => {
    const response = await api.get('/agent/tasks');
    return response.data;
  },

  // Get single task detail
  getTaskById: async (id) => {
    const response = await api.get(`/agent/tasks/${id}`);
    return response.data;
  },

  // Human-in-the-loop: Approve proposal
  approveTask: async (taskId) => {
    const response = await api.post(`/agent/tasks/${taskId}/approve`);
    return response.data;
  },

  // Human-in-the-loop: Reject proposal
  rejectTask: async (taskId, reason = 'Administrative cancellation') => {
    const response = await api.post(`/agent/tasks/${taskId}/reject`, { reason });
    return response.data;
  },

  // Student AI Career Assistant chat
  sendStudentCareerMessage: async (message) => {
    const response = await api.post('/agent/student-chat', { message });
    return response.data;
  },
};

export default agentService;

