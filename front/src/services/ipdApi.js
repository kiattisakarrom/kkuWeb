import axios from 'axios';
import { API_SCREEN } from '../../config';

const TOKEN_KEY = 'ipd-viewer-token';
export const getSessionToken = () => sessionStorage.getItem(TOKEN_KEY);
export const saveSessionToken = (token) => {
  localStorage.removeItem('token');
  sessionStorage.setItem(TOKEN_KEY, token);
};
export const clearSessionToken = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('token');
};

export const ipdApi = axios.create({ baseURL: API_SCREEN, timeout: 15000 });
ipdApi.interceptors.request.use((config) => {
  const token = getSessionToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
ipdApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.url !== '/login') {
      clearSessionToken();
      window.dispatchEvent(new Event('ipd-session-expired'));
    }
    return Promise.reject(error);
  }
);

export function apiMessage(error, fallback) {
  return (
    error.response?.data?.message ||
    (error.code === 'ECONNABORTED' ? 'ระบบตอบกลับช้า กรุณาลองใหม่' : fallback)
  );
}
