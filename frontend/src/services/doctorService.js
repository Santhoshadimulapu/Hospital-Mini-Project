import API from '../utils/api';

const doctorService = {
  getAll: () => API.get('/doctors'),
  getPaged: (params) => API.get('/doctors/paged', { params }),
  create: (data) => API.post('/doctors', data),
  update: (id, data) => API.put(`/doctors/${id}`, data),
  remove: (id) => API.delete(`/doctors/${id}`),
  getBySpecialization: (spec) => API.get(`/doctors/specialization/${spec}`),
  getByHospital: (hospitalId) => API.get(`/doctors/hospital/${hospitalId}`),
  updateSlots: (id, data) => API.put(`/doctors/slots/${id}`, data),
};

export default doctorService;
