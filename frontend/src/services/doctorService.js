import API from '../utils/api';

const doctorService = {
  getAll: () => API.get('/doctors'),
  create: (data) => API.post('/doctors', data),
  getBySpecialization: (spec) => API.get(`/doctors/specialization/${spec}`),
  getByHospital: (hospitalId) => API.get(`/doctors/hospital/${hospitalId}`),
  updateSlots: (id, data) => API.put(`/doctors/slots/${id}`, data),
};

export default doctorService;
