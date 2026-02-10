export type AuthClient = 'web' | 'mobile';

export type RegisterRequest = {
  email: string;
  password: string;
  displayName: string;
  client?: AuthClient;
};

export type LoginRequest = {
  email: string;
  password: string;
  client?: AuthClient;
};

export type ForgotPasswordRequest = {
  email: string;
  client?: AuthClient;
};

export type ResetPasswordRequest = {
  userId: string;
  token: string;
  newPassword: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
};
