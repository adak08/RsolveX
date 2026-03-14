import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Picks the right token based on who is logged in
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  const staffToken = localStorage.getItem('staffToken');
  const userToken  = localStorage.getItem('accessToken');
  const token = adminToken || staffToken || userToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Auto-refresh access token on 401 — only for regular users (not admin/staff)
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const orig = err.config;
    const isUserSession = !localStorage.getItem('adminToken') && !localStorage.getItem('staffToken');

    if (err.response?.status === 401 && !orig._retry && isUserSession) {
      orig._retry = true;
      try {
        const res = await axios.post(
          `${BASE_URL}/api/users/refresh-token`,
          {},
          { withCredentials: true }
        );
        if (res.data.accessToken) {
          localStorage.setItem('accessToken', res.data.accessToken);
          orig.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(orig);
        }
      } catch {
        localStorage.clear();
        window.location.href = '/';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
