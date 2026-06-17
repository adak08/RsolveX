/**
 * src/api/axios.js
 *
 * CHANGED:
 *  - baseURL now falls back to '' (empty string) when VITE_API_URL is not set.
 *    An empty baseURL makes axios use relative URLs, which means in production
 *    every request (e.g. /api/users/login) goes to the same origin that served
 *    the page — i.e. the Express backend on Render.
 *  - BASE_URL export still keeps the full URL for the token-refresh call,
 *    using window.location.origin as the production fallback.
 *  - All other interceptor logic (CSRF, token refresh) is unchanged.
 */

import axios from 'axios';

// ─── Base URL ──────────────────────────────────────────────────────────────────
// In development  → VITE_API_URL = "http://localhost:3000"  (set in .env.development)
// In production   → VITE_API_URL = ""  (empty, set in .env.production)
//                   An empty baseURL makes every axios call use a relative path,
//                   so /api/... requests go to the same origin serving the page.
const API_URL = import.meta.env.VITE_API_URL || '';

// Exported for use in the token-refresh call below (needs an absolute URL for
// the raw axios.post to avoid infinite interceptor loops).
export const BASE_URL =
  API_URL || (typeof window !== 'undefined' ? window.location.origin : '');

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  // CHANGED: use the resolved API_URL ('' in production → relative URLs)
  baseURL: API_URL,
  // CRITICAL: sends cookies (including the httpOnly CSRF cookie) with every request
  withCredentials: true,
});

// ─── CSRF Setup ───────────────────────────────────────────────────────────────
// Fetch the CSRF token once when the app boots and attach it to all requests.
export const setupCSRF = async () => {
  try {
    const response = await api.get('/api/csrf-token');
    const csrfToken = response.data.csrfToken;
    api.defaults.headers.common['X-CSRF-Token'] = csrfToken;
    // console.log('✅ CSRF Token successfully set');
  } catch (error) {
    console.error('Failed to fetch CSRF token', error);
  }
};

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Picks the right bearer token based on who is logged in (admin / staff / user).
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  const staffToken = localStorage.getItem('staffToken');
  const userToken  = localStorage.getItem('accessToken');
  const token = adminToken || staffToken || userToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Auto-refresh access token on 401 — only for regular users (not admin/staff).
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const orig = err.config;
    const isUserSession =
      !localStorage.getItem('adminToken') && !localStorage.getItem('staffToken');

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
