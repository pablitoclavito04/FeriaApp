// Shared axios instance for all API calls. Uses VITE_API_URL when set (dev),
// else a relative /api base so requests go through the nginx proxy (Docker /
// production). A request interceptor attaches the JWT to every call.
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Add token to every request automatically
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;