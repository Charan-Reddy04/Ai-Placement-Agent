import api from './api';

export const applicationService = {
  getApplications: async (params = {}) => {
    const response = await api.get('/applications', { params });
    return response.data;
  },

  getApplicationById: async (id) => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },

  updateApplicationStatus: async (id, status, reviewNotes = '') => {
    const response = await api.patch(`/applications/${id}/status`, {
      status,
      reviewNotes,
    });
    return response.data;
  },
};

export default applicationService;

