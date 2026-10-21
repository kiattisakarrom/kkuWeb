// Production uses the current HTTPS origin, including the existing hospital proxy.
// Development can still call the backend on this computer directly.
const origin = (
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? 'http://localhost:3000' : '')
).replace(/\/+$/, '');

export const API_URL = origin;
export const API_SCREEN = `${origin}/api`;
