import API from '../utils/api';

const adminService = {
  getAllAppointments: () => API.get('/admin/appointments'),
  cancelAppointment: (id, reason) => API.delete(`/admin/appointments/${id}`, { data: { reason } }),
  getStatistics: () => API.get('/admin/statistics'),
  getAuditLogs: () => API.get('/admin/audit-logs'),
};

export default adminService;
