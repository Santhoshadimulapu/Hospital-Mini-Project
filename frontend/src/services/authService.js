import API from '../utils/api';

const authService = {
  login: (credentials) => API.post('/api/auth/login', credentials),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => !!localStorage.getItem('token'),

  getRole: () => {
    const user = authService.getCurrentUser();
    return user?.role || null;
  },
};

export default authService;
