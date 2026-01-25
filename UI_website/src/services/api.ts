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
  create: (data: any) => api.post('/bins/create', data), 
};

export const dumpingZoneAPI = {
  getAll: () => api.get('/dumping-zones'),
  create: (data: { name: string, lat: number, lng: number }) => 
    api.post('/dumping-zones/create', data),
};

export const fleetAPI = {
  getVehicles: () => api.get('/fleet/vehicles'),
  getActiveRoutes: () => api.get('/fleet/routes/active'),
  autoDispatch: () => api.post('/fleet/routes/auto-dispatch'),
  
  // Existing function for Routes Page (Driver + Ward)
  assignRoute: (data: { driver_id: string; ward_id: string }) => 
    api.post('/fleet/routes/create', data), 
  
  // ✅ ADD THIS NEW FUNCTION for Vehicles Page (Driver + Vehicle)
  assignVehicle: (data: { driver_id: string; vehicle_id: string }) => 
    api.post('/fleet/vehicles/assign', data),

  cancelRoute: (routeId: string) => api.patch(`/fleet/routes/${routeId}/cancel`),
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

export const driverAPI = {
  getAll: () => api.get('/driver/all'),
};

export const analyticsAPI = {
  getStats: () => api.get('/analytics/waste-stats'),
};

export default api;