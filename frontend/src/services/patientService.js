import API from '../utils/api';

const patientService = {
  register: (data) => API.post('/patients/register', data),
  getProfile: (id) => API.get(`/patients/${id}`),
  getAppointments: (id) => API.get(`/patients/${id}/appointments`),
  updateProfile: (id, data) => API.put(`/patients/${id}/profile`, data),
  updateSecurity: (id, data) => API.put(`/patients/${id}/security`, data),
  changePassword: (id, data) => API.put(`/patients/${id}/password`, data),
  deleteAccount: (id, data) => API.delete(`/patients/${id}`, { data }),
};

export default patientService;
