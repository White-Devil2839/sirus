import axios from 'axios';

// In dev, calls hit /api (Vite proxies to the server). In prod, set VITE_API_URL
// to the deployed API origin, e.g. https://sirus-api.onrender.com/api
const baseURL = import.meta.env.VITE_API_URL || '/api';

// 45s timeout: long enough for a live LLM generation, short enough that a
// downed backend surfaces as an error instead of an infinite spinner.
export const api = axios.create({ baseURL, timeout: 45000 });

export function setAuthToken(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

// Normalize server error messages for toasts/inline errors.
export function errMsg(error, fallback = 'Something went wrong') {
  return error?.response?.data?.error || error?.message || fallback;
}
