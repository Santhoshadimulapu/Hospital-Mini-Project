import API from '../utils/api';

const queueService = {
  getStatus: (doctorId) => API.get(`/queue/status/${doctorId}`),
  getWaitTime: (appointmentId) => API.get(`/queue/wait-time/${appointmentId}`),
  callNext: (doctorId, date) => API.post(`/queue/call-next/${doctorId}`, null, { params: { date } }),
  skipMissed: (appointmentId) => API.post(`/queue/skip-missed/${appointmentId}`),
};

export default queueService;
