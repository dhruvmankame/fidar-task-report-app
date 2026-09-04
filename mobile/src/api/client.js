import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_API_URL } from '../config';

// A single axios instance shared across the whole app.
const api = axios.create({ timeout: 12000 });

const clean = (url) => (url || '').trim().replace(/\/+$/, '');

// Load the saved server URL (or the default) into axios. Call once on startup.
export async function initApi() {
  const saved = await AsyncStorage.getItem('serverUrl');
  api.defaults.baseURL = clean(saved) || DEFAULT_API_URL;
  return api.defaults.baseURL;
}

// Change the backend URL at runtime (used by the "Server settings" panel).
export async function setServerUrl(url) {
  api.defaults.baseURL = clean(url) || DEFAULT_API_URL;
  await AsyncStorage.setItem('serverUrl', api.defaults.baseURL);
  return api.defaults.baseURL;
}

export function getServerUrl() {
  return api.defaults.baseURL || DEFAULT_API_URL;
}

// Attach the JWT (if we have one) to every request.
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turn axios errors into plain Error objects with a friendly message,
// so screens can just show err.message.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    let message = 'Network error — is the server running and the URL correct?';
    if (error.response) {
      message = error.response.data?.message || `Request failed (${error.response.status})`;
    } else if (error.code === 'ECONNABORTED') {
      message = 'Request timed out.';
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
