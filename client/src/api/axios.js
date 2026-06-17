import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
    // 👇 CRITICAL: This allows cookies (and your CSRF token) to be sent
  withCredentials: true
});

// Fetch the CSRF token when the app loads
export const setupCSRF = async () => {
    try {
        const response = await api.get('/api/csrf-token');
        const csrfToken = response.data.csrfToken;
        
        // Set it as a default header for all future requests
        api.defaults.headers.common['X-CSRF-Token'] = csrfToken;
        console.log("✅ CSRF Token successfully set");
    } catch (error) {
        console.error("Failed to fetch CSRF token", error);
    }
};

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
