import API from '../utils/api';

const adminService = {
  getAllAppointments: () => API.get('/admin/appointments'),
  cancelAppointment: (id) => API.delete(`/admin/appointments/${id}`),
  getStatistics: () => API.get('/admin/statistics'),
};

export default adminService;
