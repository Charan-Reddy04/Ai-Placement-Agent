import api from './api';

export const interviewService = {
  // Interviews
  getInterviews: async (params = {}) => {
    const response = await api.get('/interviews', { params });
    return response.data;
  },

  getInterviewById: async (id) => {
    const response = await api.get(`/interviews/${id}`);
    return response.data;
  },

  createInterview: async (interviewData) => {
    const response = await api.post('/interviews', interviewData);
    return response.data;
  },

  updateInterview: async (id, interviewData) => {
    const response = await api.put(`/interviews/${id}`, interviewData);
    return response.data;
  },

  updateInterviewStatus: async (id, statusData) => {
    const response = await api.patch(`/interviews/${id}/status`, statusData);
    return response.data;
  },

  deleteInterview: async (id) => {
    const response = await api.delete(`/interviews/${id}`);
    return response.data;
  },

  checkConflict: async (conflictData) => {
    const response = await api.post('/interviews/check-conflict', conflictData);
    return response.data;
  },

  // Panels
  getPanels: async () => {
    const response = await api.get('/interviews/panels');
    return response.data;
  },

  getPanelById: async (id) => {
    const response = await api.get(`/interviews/panels/${id}`);
    return response.data;
  },

  createPanel: async (panelData) => {
    const response = await api.post('/interviews/panels', panelData);
    return response.data;
  },

  updatePanel: async (id, panelData) => {
    const response = await api.put(`/interviews/panels/${id}`, panelData);
    return response.data;
  },

  deletePanel: async (id) => {
    const response = await api.delete(`/interviews/panels/${id}`);
    return response.data;
  },

  // Venues
  getVenues: async () => {
    const response = await api.get('/interviews/venues');
    return response.data;
  },

  getVenueById: async (id) => {
    const response = await api.get(`/interviews/venues/${id}`);
    return response.data;
  },

  createVenue: async (venueData) => {
    const response = await api.post('/interviews/venues', venueData);
    return response.data;
  },

  updateVenue: async (id, venueData) => {
    const response = await api.put(`/interviews/venues/${id}`, venueData);
    return response.data;
  },

  deleteVenue: async (id) => {
    const response = await api.delete(`/interviews/venues/${id}`);
    return response.data;
  },
};

export default interviewService;
