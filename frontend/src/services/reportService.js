import API from '../utils/api';

const reportService = {
  create: (doctorId, data) => API.post(`/reports/doctor/${doctorId}`, data),
  getById: (id) => API.get(`/reports/${id}`),
  getByAppointment: (appointmentId) => API.get(`/reports/appointment/${appointmentId}`),
  getByPatient: (patientId) => API.get(`/reports/patient/${patientId}`),
  getByDoctor: (doctorId) => API.get(`/reports/doctor/${doctorId}`),
};

export default reportService;
