import api from './api';

export const notificationService = {
  getMyNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  getAllBroadcasts: async (params = {}) => {
    const response = await api.get('/notifications/all-broadcasts', { params });
    return response.data;
  },

  markNotificationRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllNotificationsRead: async () => {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  },

  createNotification: async (data) => {
    const response = await api.post('/notifications', data);
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

export default notificationService;
