import { api } from '@/shared/api/http-client';
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
  refresh: () => api.post<AuthResponse>('/auth/refresh'),
  revoke: (refreshToken?: string) => api.post<void>('/auth/revoke', refreshToken ? { refreshToken } : undefined),
  forgotPassword: (payload: ForgotPasswordRequest) =>
    api.post<void>('/auth/forgot-password', { ...payload, client: payload.client ?? 'web' }),
  resetPassword: (payload: ResetPasswordRequest) =>
    api.post<void>('/auth/reset-password', payload),
};
