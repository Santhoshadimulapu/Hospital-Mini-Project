import API from '../utils/api';

const appointmentService = {
  book: (data) => API.post('/appointments/book', data),
  getById: (id) => API.get(`/appointments/${id}`),
  getByDoctor: (doctorId) => API.get(`/appointments/doctor/${doctorId}`),
  cancel: (id, reason) => API.delete(`/appointments/${id}`, { data: { reason } }),
  reschedule: (id, data) => API.patch(`/appointments/${id}/reschedule`, data),
  updateStatus: (id, status) => API.patch(`/appointments/${id}/status`, null, { params: { status } }),
};

export default appointmentService;
