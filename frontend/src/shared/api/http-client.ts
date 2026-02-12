import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { toast } from '@/shared/hooks/use-toast';
import { getDeviceId } from '@/shared/security/device-id';
import { store } from '@/app/store/store';
import { setTokens } from '@/domains/auth/store/auth-slice';

const API_BASE =
  import.meta.env.VITE_API_BASE ??
  (import.meta.env.PROD ? 'https://learnsys.runasp.net/api' : '/api');
const CSRF_COOKIE = 'XSRF-TOKEN';
const CSRF_HEADER = 'X-CSRF-Token';
const DEVICE_HEADER = 'X-Device-Id';
const AUTH_PATHS = [
  '/auth/refresh',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
];

let authStateHandler: ((isAuthenticated: boolean) => void) | null = null;
let refreshPromise: Promise<boolean> | null = null;

const getStoredAccessToken = () => store.getState().auth.accessToken ?? '';
const getStoredRefreshToken = () => store.getState().auth.refreshToken ?? '';

export const authTokenStore = {
  setTokens: (accessToken?: string | null, refreshToken?: string | null) => {
    store.dispatch(setTokens({ accessToken: accessToken ?? null, refreshToken: refreshToken ?? null }));
  },
  clear: () => {
    store.dispatch(setTokens({ accessToken: null, refreshToken: null }));
  },
  getAccessToken: getStoredAccessToken,
  getRefreshToken: getStoredRefreshToken,
};

export const registerAuthStateHandler = (handler: (isAuthenticated: boolean) => void) => {
  authStateHandler = handler;
};

const baseConfig: AxiosRequestConfig = {
  baseURL: API_BASE,
  withCredentials: true,
  xsrfCookieName: CSRF_COOKIE,
  xsrfHeaderName: CSRF_HEADER,
};

const client = axios.create(baseConfig);
const refreshClient = axios.create(baseConfig);
const retriedRequests = new WeakSet<InternalAxiosRequestConfig>();

const applySecurityHeaders = (config: InternalAxiosRequestConfig) => {
  const headers = AxiosHeaders.from(config.headers);
  if (!headers.has(DEVICE_HEADER)) headers.set(DEVICE_HEADER, getDeviceId());

  const url = String(config.url ?? '');
  const accessToken = getStoredAccessToken();
  if (accessToken && !headers.has('Authorization') && !url.includes('/auth/')) {
    headers.setAuthorization(`Bearer ${accessToken}`);
  }

  config.headers = headers;
  return config;
};

client.interceptors.request.use(applySecurityHeaders);
refreshClient.interceptors.request.use(applySecurityHeaders);

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config;
    const url = String(original?.url ?? '');
    const isAuthRequest = AUTH_PATHS.some((path) => url.includes(path));

    if (error.response?.status !== 401 || !original || retriedRequests.has(original) || isAuthRequest) {
      return Promise.reject(error);
    }

    retriedRequests.add(original);
    const ok = await refreshAccessToken();
    return ok ? client.request(original) : Promise.reject(error);
  }
);

const flattenErrors = (errors: unknown) =>
  Array.isArray(errors)
    ? errors.map((item) => String(item ?? '')).filter(Boolean).join(', ')
    : Object.values((errors ?? {}) as Record<string, unknown>)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .map((item) => String(item ?? ''))
        .filter(Boolean)
        .join(', ');

const toApiErrorMessage = (error: unknown) => {
  const payload = (error ?? {}) as Record<string, unknown>;
  return String(payload.message ?? '') || flattenErrors(payload.errors);
};

const maybeStoreAuthTokens = (value: unknown) => {
  const payload = (value ?? {}) as Record<string, unknown>;
  const accessToken = payload.accessToken;
  const refreshToken = payload.refreshToken;

  if (!accessToken || !refreshToken) return;
  authTokenStore.setTokens(String(accessToken), String(refreshToken));
};

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = refreshClient
    .post<unknown>('/auth/refresh')
    .then((response) => {
      const payload = (response.data ?? {}) as Record<string, unknown>;
      const ok = payload.success === true;

      if (ok) maybeStoreAuthTokens(payload.data);
      if (!ok) authTokenStore.clear();
      authStateHandler?.(ok);
      return ok;
    })
    .catch(() => {
      authTokenStore.clear();
      authStateHandler?.(false);
      return false;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

const toErrorMessage = (error: unknown) => {
  if (!axios.isAxiosError(error)) return error instanceof Error ? error.message : 'Co loi xay ra';

  const data = (error.response?.data ?? {}) as Record<string, unknown>;
  const nestedError = (data.error ?? {}) as Record<string, unknown>;
  const message =
    String(nestedError.message ?? '') ||
    String(data.detail ?? '') ||
    String(data.message ?? '') ||
    flattenErrors(nestedError.errors ?? data.errors) ||
    String(data.title ?? '') ||
    error.response?.statusText ||
    error.message;

  return message || 'Co loi xay ra';
};

const unwrap = <T, D = unknown>(promise: Promise<AxiosResponse<T, D>>) =>
  promise
    .then((res) => {
      const payload = (res.data ?? {}) as Record<string, unknown>;
      if (!('success' in payload && 'data' in payload)) return res.data;
      if (payload.success !== true) {
        const message = toApiErrorMessage(payload.error) || 'Co loi xay ra';
        toast({ variant: 'destructive', description: message });
        throw new Error(message);
      }

      maybeStoreAuthTokens(payload.data);
      return payload.data as T;
    })
    .catch((error) => {
      const message = toErrorMessage(error);
      toast({ variant: 'destructive', description: message });
      throw new Error(message);
    });

const toHeaderString = (value: unknown) =>
  Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '');

export const api = {
  request: <T, D = unknown>(config: AxiosRequestConfig<D>) =>
    unwrap<T, D>(client.request<T, AxiosResponse<T, D>, D>(config)),
  get: <T, D = unknown>(path: string, config?: AxiosRequestConfig<D>) =>
    unwrap<T, D>(client.get<T, AxiosResponse<T, D>, D>(path, config)),
  post: <T, D = unknown>(path: string, body?: D, config?: AxiosRequestConfig<D>) =>
    unwrap<T, D>(client.post<T, AxiosResponse<T, D>, D>(path, body, config)),
  put: <T, D = unknown>(path: string, body?: D, config?: AxiosRequestConfig<D>) =>
    unwrap<T, D>(client.put<T, AxiosResponse<T, D>, D>(path, body, config)),
  patch: <T, D = unknown>(path: string, body?: D, config?: AxiosRequestConfig<D>) =>
    unwrap<T, D>(client.patch<T, AxiosResponse<T, D>, D>(path, body, config)),
  delete: <T, D = unknown>(path: string, config?: AxiosRequestConfig<D>) =>
    unwrap<T, D>(client.delete<T, AxiosResponse<T, D>, D>(path, config)),
  upload: <T>(path: string, file: File, config?: AxiosRequestConfig<FormData>) => {
    const form = new FormData();
    form.append('file', file);
    return unwrap<T, FormData>(
      client.post<T, AxiosResponse<T, FormData>, FormData>(path, form, config)
    );
  },
  download: (path: string, config?: AxiosRequestConfig<never>) =>
    client
      .get<Blob, AxiosResponse<Blob>, never>(path, {
        ...config,
        responseType: 'blob',
      })
      .then((res) => {
        const contentType = toHeaderString(res.headers['content-type']) || 'application/octet-stream';
        const disposition = toHeaderString(res.headers['content-disposition']);
        const match = /filename\*=UTF-8''([^;]+)|filename="?([^;"]+)"?/i.exec(disposition);
        const fileName = match ? decodeURIComponent(match[1] || match[2]) : 'download';

        return { blob: res.data, fileName, contentType };
      })
      .catch((error) => {
        const message = toErrorMessage(error);
        toast({ variant: 'destructive', description: message });
        throw new Error(message);
      }),
};

export { refreshAccessToken };
