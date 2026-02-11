import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from '@/shared/hooks/use-toast';
import { getDeviceId } from '@/shared/security/device-id';

const API_BASE =
  import.meta.env.VITE_API_BASE ??
  (import.meta.env.PROD ? 'https://learnsys.runasp.net/api' : '/api');
const CSRF_COOKIE = 'XSRF-TOKEN';
const CSRF_HEADER = 'X-CSRF-Token';
const DEVICE_HEADER = 'X-Device-Id';
const ACCESS_TOKEN_KEY = 'education.access_token';
const REFRESH_TOKEN_KEY = 'education.refresh_token';

const SAFE_METHODS = new Set(['get', 'head', 'options']);

type AuthStateHandler = (isAuthenticated: boolean) => void;

let authStateHandler: AuthStateHandler | null = null;
let refreshPromise: Promise<boolean> | null = null;

let accessTokenCache: string | null = null;
let refreshTokenCache: string | null = null;

const safeStorage = {
  get: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore storage failures (private mode, blocked, etc.)
    }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore storage failures
    }
  },
};

const ensureTokenCache = () => {
  if (typeof localStorage === 'undefined') return;
  if (accessTokenCache === null) {
    accessTokenCache = safeStorage.get(ACCESS_TOKEN_KEY);
  }
  if (refreshTokenCache === null) {
    refreshTokenCache = safeStorage.get(REFRESH_TOKEN_KEY);
  }
};

const getStoredAccessToken = () => {
  if (accessTokenCache === null) {
    ensureTokenCache();
  }
  return accessTokenCache ?? '';
};

const getStoredRefreshToken = () => {
  if (refreshTokenCache === null) {
    ensureTokenCache();
  }
  return refreshTokenCache ?? '';
};

export const authTokenStore = {
  setTokens: (accessToken?: string, refreshToken?: string) => {
    if (typeof accessToken === 'string') {
      accessTokenCache = accessToken;
      accessToken ? safeStorage.set(ACCESS_TOKEN_KEY, accessToken) : safeStorage.remove(ACCESS_TOKEN_KEY);
    }
    if (typeof refreshToken === 'string') {
      refreshTokenCache = refreshToken;
      refreshToken ? safeStorage.set(REFRESH_TOKEN_KEY, refreshToken) : safeStorage.remove(REFRESH_TOKEN_KEY);
    }
  },
  clear: () => {
    accessTokenCache = '';
    refreshTokenCache = '';
    safeStorage.remove(ACCESS_TOKEN_KEY);
    safeStorage.remove(REFRESH_TOKEN_KEY);
  },
  getAccessToken: getStoredAccessToken,
  getRefreshToken: getStoredRefreshToken,
};

export const registerAuthStateHandler = (handler: AuthStateHandler) => {
  authStateHandler = handler;
};

const client = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

const getCookieValue = (name: string): string => {
  if (typeof document === 'undefined') return '';
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
};

const applySecurityHeaders = (config: InternalAxiosRequestConfig) => {
  config.headers = config.headers ?? {};
  const headers = config.headers as Record<string, string>;
  if (!headers[DEVICE_HEADER]) {
    headers[DEVICE_HEADER] = getDeviceId();
  }

  const method = (config.method ?? 'get').toLowerCase();
  if (!SAFE_METHODS.has(method)) {
    const csrfToken = getCookieValue(CSRF_COOKIE);
    if (csrfToken && !headers[CSRF_HEADER]) {
      headers[CSRF_HEADER] = csrfToken;
    }
  }

  const url = String(config.url ?? '');
  if (!headers.Authorization && !url.includes('/auth/')) {
    const accessToken = getStoredAccessToken();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  return config;
};

client.interceptors.request.use(applySecurityHeaders);
refreshClient.interceptors.request.use(applySecurityHeaders);

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    const url = String(original?.url ?? '');
    const isAuthRequest =
      url.includes('/auth/refresh') ||
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/forgot-password') ||
      url.includes('/auth/reset-password');
    if (status === 401 && original && !original._retry && !isAuthRequest) {
      original._retry = true;
      const ok = await refreshAccessToken();
      if (ok) {
        return client(original);
      }
    }

    return Promise.reject(error);
  }
);

type ErrorBag = string[] | Record<string, string[]>;

type ApiError = {
  code?: string;
  message?: string;
  errors?: ErrorBag;
};

type ApiResponse<T> = {
  success?: boolean;
  data?: T;
  error?: ApiError;
};

type ErrorResponse = {
  title?: string;
  detail?: string;
  message?: string;
  errors?: ErrorBag;
  error?: ApiError;
};

function flattenErrors(errors?: ErrorBag) {
  if (!errors) return '';
  if (Array.isArray(errors)) return errors.join(', ');
  const flattened = Object.values(errors).flat().filter(Boolean);
  return flattened.length ? flattened.join(', ') : '';
}

function getApiErrorMessage(error?: ApiError) {
  if (!error) return '';
  if (typeof error.message === 'string' && error.message.trim()) return error.message;
  const errorList = flattenErrors(error.errors);
  return errorList || '';
}

type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
};

type AuthTokens = RefreshTokenResponse;

const maybeStoreAuthTokens = (value: unknown) => {
  if (!value || typeof value !== 'object') return;
  const data = value as Partial<AuthTokens>;
  if (typeof data.accessToken === 'string' && typeof data.refreshToken === 'string') {
    authTokenStore.setTokens(data.accessToken, data.refreshToken);
  }
};

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshToken = authTokenStore.getRefreshToken();
      const body = refreshToken ? { refreshToken } : {};
      const response = await refreshClient.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', body);
      const payload = response.data as ApiResponse<RefreshTokenResponse>;
      const ok = payload?.success === true;
      if (ok) {
        maybeStoreAuthTokens(payload.data);
      } else {
        authTokenStore.clear();
      }
      authStateHandler?.(ok);
      return ok;
    } catch {
      authTokenStore.clear();
      authStateHandler?.(false);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function toErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError;
    const data = err.response?.data as unknown;
    if (typeof data === 'string') return data;
    if (typeof Blob !== 'undefined' && data instanceof Blob) {
      return err.response?.statusText || err.message;
    }

    if (data && typeof data === 'object') {
      const payload = data as ErrorResponse;
      if (payload.error) {
        const apiMessage = getApiErrorMessage(payload.error);
        if (apiMessage) return apiMessage;
      }
      if (typeof payload.detail === 'string' && payload.detail.trim()) return payload.detail;
      if (typeof payload.message === 'string' && payload.message.trim()) return payload.message;

      const errorList = flattenErrors(payload.errors);
      if (errorList) return errorList;

      if (typeof payload.title === 'string' && payload.title.trim()) return payload.title;
    }

    return err.response?.statusText || err.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Co loi xay ra';
}

async function unwrap<T>(promise: Promise<AxiosResponse<T>>) {
  try {
    const res = await promise;
    const payload = res.data as unknown;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      const api = payload as ApiResponse<T>;
      if (api.success) {
        maybeStoreAuthTokens(api.data);
        return api.data as T;
      }
      const message = getApiErrorMessage(api.error) || 'Co loi xay ra';
      toast({ variant: 'destructive', description: message });
      throw new Error(message);
    }

    return res.data;
  } catch (error) {
    const message = toErrorMessage(error);
    toast({ variant: 'destructive', description: message });
    throw new Error(message);
  }
}

export const api = {
  get: <T>(path: string) => unwrap<T>(client.get<T>(path)),
  post: <T>(path: string, body?: unknown) => unwrap<T>(client.post<T>(path, body)),
  put: <T>(path: string, body?: unknown) => unwrap<T>(client.put<T>(path, body)),
  patch: <T>(path: string, body?: unknown) => unwrap<T>(client.patch<T>(path, body)),
  delete: <T>(path: string) => unwrap<T>(client.delete<T>(path)),
  upload: <T>(
    path: string,
    file: File,
    options?: { fieldName?: string; extra?: Record<string, string | Blob> }
  ) => {
    const form = new FormData();
    const fieldName = options?.fieldName ?? 'file';
    form.append(fieldName, file);
    if (options?.extra) {
      Object.entries(options.extra).forEach(([key, value]) => form.append(key, value));
    }

    return unwrap<T>(client.post<T>(path, form));
  },
  download: async (path: string) => {
    try {
      const res = await client.get<Blob>(path, { responseType: 'blob' });
      const contentType = res.headers['content-type'] ?? 'application/octet-stream';
      const disposition = res.headers['content-disposition'] ?? '';
      const match = /filename\*=UTF-8''([^;]+)|filename="?([^;"]+)"?/i.exec(disposition);
      const fileName = match ? decodeURIComponent(match[1] || match[2]) : 'download';

      return { blob: res.data, fileName, contentType };
    } catch (error) {
      const message = toErrorMessage(error);
      toast({ variant: 'destructive', description: message });
      throw new Error(message);
    }
  },
};

export { refreshAccessToken };
