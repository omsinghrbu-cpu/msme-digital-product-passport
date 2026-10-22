import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((c) => {
  const t = localStorage.getItem('dpp_token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

export const message = (e) => e.response?.data?.error || 'Unable to complete that request.';

export const getPublicAppUrl = () => {
  const envUrl = import.meta.env.VITE_PUBLIC_APP_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'http://localhost:5173';
};

export const getVerificationUrl = (passportIdOrId) => {
  const baseUrl = getPublicAppUrl();
  return `${baseUrl}/verify/${encodeURIComponent(passportIdOrId)}`;
};
