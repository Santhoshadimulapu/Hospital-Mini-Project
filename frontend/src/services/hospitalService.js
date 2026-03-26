import API from '../utils/api';

const hospitalService = {
  getAll: () => API.get('/hospitals'),
  getPaged: (params) => API.get('/hospitals/paged', { params }),
  getById: (id) => API.get(`/hospitals/${id}`),
  getByCity: (city) => API.get(`/hospitals/city/${city}`),
  search: (query, city) => API.get('/hospitals/search', { params: { q: query, city } }),
  create: (data) => API.post('/hospitals', data),
  update: (id, data) => API.put(`/hospitals/${id}`, data),
  remove: (id) => API.delete(`/hospitals/${id}`),
};

export default hospitalService;
