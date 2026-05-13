import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const API = axios.create({ baseURL: BASE_URL });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(res => res, async err => {
  const orig = err.config;
  if (err.response?.status === 401 && !orig._retry) {
    orig._retry = true;
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      try {
        const res = await axios.post(`${BASE_URL.replace('/api','')}/api/token/refresh/`, { refresh });
        localStorage.setItem('access_token', res.data.access);
        orig.headers.Authorization = `Bearer ${res.data.access}`;
        return API(orig);
      } catch { localStorage.clear(); window.location.href = '/login'; }
    }
  }
  return Promise.reject(err);
});

export default API;
