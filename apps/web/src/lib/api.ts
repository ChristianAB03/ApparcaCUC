import axios, { AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

const TOKEN_KEY = 'apparcacuc_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

// Attach the bearer token to every request.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface NormalizedError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// Normalize errors into a predictable shape and surface expired sessions.
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ error?: { code?: string; message?: string; details?: Record<string, string[]> } }>) => {
    const status = error.response?.status ?? 0;
    const payload = error.response?.data?.error;
    const normalized: NormalizedError = {
      status,
      code: payload?.code ?? 'NETWORK_ERROR',
      message:
        payload?.message ??
        (status === 0 ? 'No pudimos conectar con el servidor. Verifica tu conexión.' : 'Ocurrió un error inesperado.'),
      details: payload?.details,
    };
    // A 401 while a token exists means the session expired — trigger logout.
    if (status === 401 && getToken()) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(normalized);
  },
);

export function isNormalizedError(e: unknown): e is NormalizedError {
  return typeof e === 'object' && e !== null && 'code' in e && 'message' in e;
}

/** Extracts a user-friendly message from any thrown API error. */
export function errorMessage(e: unknown, fallback = 'Ocurrió un error.'): string {
  if (isNormalizedError(e)) return e.message;
  if (e instanceof Error) return e.message;
  return fallback;
}
