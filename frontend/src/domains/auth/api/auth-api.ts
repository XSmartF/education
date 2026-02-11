import { api, authTokenStore } from '@/shared/api/http-client';
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from '../model/types';

export const authApi = {
  register: (payload: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', { ...payload, client: payload.client ?? 'web' }),
  login: (payload: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', { ...payload, client: payload.client ?? 'web' }),
  refresh: () => {
    const refreshToken = authTokenStore.getRefreshToken();
    return api.post<AuthResponse>('/auth/refresh', refreshToken ? { refreshToken } : undefined);
  },
  revoke: async (refreshToken?: string) => {
    const res = await api.post<void>('/auth/revoke', refreshToken ? { refreshToken } : undefined);
    authTokenStore.clear();
    return res;
  },
  forgotPassword: (payload: ForgotPasswordRequest) =>
    api.post<void>('/auth/forgot-password', { ...payload, client: payload.client ?? 'web' }),
  resetPassword: (payload: ResetPasswordRequest) =>
    api.post<void>('/auth/reset-password', payload),
};
