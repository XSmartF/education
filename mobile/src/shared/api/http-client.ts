const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? 'http://10.0.2.2:5000/api';
const ACCESS_TOKEN_KEY = 'education_token';
const REFRESH_TOKEN_KEY = 'education_refresh_token';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeviceId } from '@/shared/security/device-id';

export const tokenStore = {
  getAccess: () => AsyncStorage.getItem(ACCESS_TOKEN_KEY),
  setAccess: (token: string) => AsyncStorage.setItem(ACCESS_TOKEN_KEY, token),
  getRefresh: () => AsyncStorage.getItem(REFRESH_TOKEN_KEY),
  setRefresh: (token: string) => AsyncStorage.setItem(REFRESH_TOKEN_KEY, token),
  clear: async () => {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

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

const isStringValue = (value: unknown): value is string =>
  Object.prototype.toString.call(value) === '[object String]';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === '[object Object]';

function flattenErrors(errors?: ErrorBag) {
  if (!errors) return '';
  if (Array.isArray(errors)) return errors.join(', ');
  const flattened = Object.values(errors).flat().filter(Boolean);
  return flattened.length ? flattened.join(', ') : '';
}

function getApiErrorMessage(error?: ApiError) {
  if (!error) return '';
  if (isStringValue(error.message) && error.message.trim()) return error.message;
  const errorList = flattenErrors(error.errors);
  return errorList || '';
}

function getErrorMessage(payload: unknown) {
  if (!isRecord(payload)) return '';
  const data = payload as ErrorResponse;
  if (data.error) {
    const message = getApiErrorMessage(data.error);
    if (message) return message;
  }
  if (isStringValue(data.detail) && data.detail.trim()) return data.detail;
  if (isStringValue(data.message) && data.message.trim()) return data.message;
  const errors = flattenErrors(data.errors);
  if (errors) return errors;
  if (isStringValue(data.title) && data.title.trim()) return data.title;
  return '';
}

async function readErrorMessage(response: Response) {
  const raw = await response.text();
  if (!raw) return response.statusText;
  try {
    const data = JSON.parse(raw);
    return getErrorMessage(data) || raw;
  } catch {
    return raw;
  }
}

type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
};

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = await tokenStore.getRefresh();
    if (!refreshToken) {
      return null;
    }

    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Id': await getDeviceId(),
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      await tokenStore.clear();
      return null;
    }

    const payload = (await response.json()) as ApiResponse<RefreshTokenResponse>;
    if (payload?.success && payload.data?.accessToken && payload.data.refreshToken) {
      await tokenStore.setAccess(payload.data.accessToken);
      await tokenStore.setRefresh(payload.data.refreshToken);
      return payload.data.accessToken;
    }

    await tokenStore.clear();
    return null;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function requestRaw(path: string, options: RequestInit, allowRefresh = true) {
  const headers = new Headers(options.headers);
  const body = options.body;
  if (body && !(body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = await tokenStore.getAccess();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('X-Device-Id')) {
    headers.set('X-Device-Id', await getDeviceId());
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (response.status === 401 && allowRefresh) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      return requestRaw(path, { ...options, headers }, false);
    }
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message || response.statusText);
  }

  return response;
}

async function requestJson<T>(path: string, options: RequestInit) {
  const response = await requestRaw(path, options);
  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json()) as unknown;
  if (isRecord(payload) && 'success' in payload && 'data' in payload) {
    const api = payload as ApiResponse<T>;
    if (api.success) {
      return api.data as T;
    }
    const message = getApiErrorMessage(api.error) || 'Co loi xay ra';
    throw new Error(message);
  }

  return payload as T;
}

function toRequestBody(body?: unknown) {
  if (!body) return undefined;
  if (body instanceof FormData) return body;
  return JSON.stringify(body);
}

export const api = {
  get: <T>(path: string) => requestJson<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    requestJson<T>(path, { method: 'POST', body: toRequestBody(body) }),
  put: <T>(path: string, body?: unknown) =>
    requestJson<T>(path, { method: 'PUT', body: toRequestBody(body) }),
  patch: <T>(path: string, body?: unknown) =>
    requestJson<T>(path, { method: 'PATCH', body: toRequestBody(body) }),
  delete: <T>(path: string) => requestJson<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, form: FormData) =>
    requestJson<T>(path, { method: 'POST', body: form }),
  download: async (path: string) => {
    const response = await requestRaw(path, { method: 'GET' });
    const contentType = response.headers.get('content-type') ?? 'application/octet-stream';
    const disposition = response.headers.get('content-disposition') ?? '';
    const match = /filename\*=UTF-8''([^;]+)|filename="?([^;]+)"?/i.exec(disposition);
    const fileName = match ? decodeURIComponent(match[1] || match[2]) : 'download';
    const blob = await response.blob();

    return { blob, fileName, contentType };
  },
};
