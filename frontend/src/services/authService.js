import api from './api';

export const authService = {
  // Login with email and password
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('campuspilot_token', response.data.token);
      localStorage.setItem('campuspilot_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Register a new student
  register: async (studentData) => {
    const response = await api.post('/auth/register', studentData);
    if (response.data.token) {
      localStorage.setItem('campuspilot_token', response.data.token);
      localStorage.setItem('campuspilot_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Get admin setup status
  getSetupStatus: async () => {
    const response = await api.get('/auth/setup-status');
    return response.data;
  },

  // Bootstrap initial master admin
  bootstrapAdmin: async (adminData) => {
    const response = await api.post('/auth/bootstrap-admin', adminData);
    if (response.data.token) {
      localStorage.setItem('campuspilot_token', response.data.token);
      localStorage.setItem('campuspilot_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Get current authenticated user session
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('campuspilot_token');
      localStorage.removeItem('campuspilot_user');
    }
  },
};

export default authService;

