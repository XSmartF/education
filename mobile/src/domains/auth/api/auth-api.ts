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
    api.post<AuthResponse>('/auth/register', { ...payload, client: payload.client ?? 'mobile' }),
  login: (payload: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', { ...payload, client: payload.client ?? 'mobile' }),
  refresh: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refreshToken }),
  revoke: (refreshToken?: string) =>
    api.post<void>('/auth/revoke', refreshToken ? { refreshToken } : undefined),
  forgotPassword: (payload: ForgotPasswordRequest) =>
    api.post<void>('/auth/forgot-password', { ...payload, client: payload.client ?? 'mobile' }),
  resetPassword: (payload: ResetPasswordRequest) =>
    api.post<void>('/auth/reset-password', payload),
};
