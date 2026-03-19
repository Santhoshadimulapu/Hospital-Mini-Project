import API from '../utils/api';

const appointmentService = {
  book: (data) => API.post('/appointments/book', data),
  getById: (id) => API.get(`/appointments/${id}`),
  getByDoctor: (doctorId) => API.get(`/appointments/doctor/${doctorId}`),
  cancel: (id) => API.delete(`/appointments/${id}`),
  updateStatus: (id, status) => API.patch(`/appointments/${id}/status`, null, { params: { status } }),
};

export default appointmentService;
