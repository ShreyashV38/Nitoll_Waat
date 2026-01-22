import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  verify: (email: string, otp: string) => api.post('/auth/verify', { email, otp }),
  register: (data: any) => api.post('/auth/register', data),
};

export const binAPI = {
  getAll: () => api.get('/bins'),
  update: (bin_id: string, fill_percent: number) => api.post('/bins/update', { bin_id, fill_percent }),
  // --- ADDED THIS LINE ---
  create: (data: any) => api.post('/bins/create', data), 
};

export const fleetAPI = {
  getVehicles: () => api.get('/fleet/vehicles'),
  getActiveRoutes: () => api.get('/fleet/routes/active'),
};

export const areaAPI = {
  getById: (id: string) => api.get(`/area/${id}`),
};

export const alertAPI = {
  getAll: () => api.get('/alerts'),
};

export const wardAPI = {
  getAll: () => api.get('/wards'),
  create: (name: string) => api.post('/wards', { name }),
};

export default api;