import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return config;
});

export default api;

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login/json', data),
  me: () => api.get('/auth/me'),
};

export const timeApi = {
  active: () => api.get('/time-entries/active'),
  clockIn: (notes) => api.post('/time-entries/clock-in', { notes }),
  clockOut: (notes) => api.post('/time-entries/clock-out', { notes }),
  list: (params) => api.get('/time-entries', { params }),
  weeklySummary: () => api.get('/time-entries/summary/weekly'),
  monthlySummary: () => api.get('/time-entries/summary/monthly'),
};

export const dashboardApi = {
  get: () => api.get('/dashboard'),
  updateHourlyRate: (hourly_rate) => api.put('/settings/hourly-rate', { hourly_rate }),
};
