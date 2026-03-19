import API from '../utils/api';

const aiService = {
  recommendDoctors: (payload) => API.post('/ai/recommend-doctors', payload),
};

export default aiService;
