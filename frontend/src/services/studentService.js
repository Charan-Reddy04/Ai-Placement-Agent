import api from './api';

export const studentService = {
  // Get current logged-in student's profile
  getMyProfile: async () => {
    const response = await api.get('/students/me');
    return response.data;
  },

  // Update profile data
  updateMyProfile: async (profileData) => {
    const response = await api.put('/students/me', profileData);
    return response.data;
  },

  // Upload resume file
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    const response = await api.post('/students/me/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get current student's applications
  getMyApplications: async () => {
    const response = await api.get('/students/me/applications');
    return response.data;
  },

  // Get current student's scheduled interviews
  getMyInterviews: async () => {
    const response = await api.get('/students/me/interviews');
    return response.data;
  },

  // Admin: Get all candidate profiles
  getAllStudents: async (params = {}) => {
    const response = await api.get('/students', { params });
    return response.data;
  },

  // Admin: Get single candidate profile
  getStudentById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },
};

export default studentService;

