import API from '../utils/api';

const hospitalService = {
  getAll: () => API.get('/hospitals'),
  getById: (id) => API.get(`/hospitals/${id}`),
  getByCity: (city) => API.get(`/hospitals/city/${city}`),
  search: (query, city) => API.get('/hospitals/search', { params: { q: query, city } }),
  create: (data) => API.post('/hospitals', data),
};

export default hospitalService;
