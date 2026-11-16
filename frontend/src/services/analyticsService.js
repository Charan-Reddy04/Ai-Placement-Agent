import api from './api';

export const analyticsService = {
  getDashboardStats: async () => {
    const response = await api.get('/analytics/dashboard-stats');
    return response.data;
  },

  getDetailedAnalytics: async () => {
    const response = await api.get('/analytics/detailed');
    return response.data;
  },

  downloadPlacementCSV: async () => {
    const response = await api.get('/analytics/export/csv', {
      responseType: 'blob',
    });

    // Create a temporary anchor to trigger browser download
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `campuspilot-placement-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  },

  deleteActivityLog: async (id) => {
    const response = await api.delete(`/analytics/activity/${id}`);
    return response.data;
  },

  clearAllActivities: async () => {
    const response = await api.delete('/analytics/activities');
    return response.data;
  },
};

export default analyticsService;
