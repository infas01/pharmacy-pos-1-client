import axios from 'axios';

// Centralized Axios instance for the app
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// Helper to pull token
const getToken = () => localStorage.getItem('token');

// Helpful extractor you can import in pages if you want uniform errors
export const extractErrorMessage = (err, fallback = 'Something went wrong') => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.message === 'Network Error' || !err?.response)
    return 'Network error. Please check your connection.';
  return fallback;
};

// Request interceptor: attach auth + diagnostics
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Light diagnostics / context headers
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    config.headers['X-Client-TZ'] = tz;
  } catch {}
  config.headers['X-Client'] = 'pharmacy-pos-web';
  return config;
});

// Response interceptor: uniform handling for auth + common errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;

    // Normalize a friendly message for optional use in UIs
    err.friendlyMessage = extractErrorMessage(err);

    if (status === 401) {
      // Unauth or expired token → clear and kick to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!location.pathname.includes('/login')) {
        const redirect = encodeURIComponent(
          location.pathname + location.search
        );
        location.href = `/login?next=${redirect}`;
      }
    } else if (status === 403) {
      // Forbidden — no redirect; surface clearly in calling UI
      console.warn('Forbidden: insufficient permissions');
    }

    return Promise.reject(err);
  }
);

export default api;
