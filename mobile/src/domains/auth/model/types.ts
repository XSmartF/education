export type AuthClient = 'web' | 'mobile';
export type UserRole = 'Student' | 'Teacher' | 'Organize';

export type RegisterRequest = {
  email: string;
  password: string;
  displayName: string;
  role?: UserRole;
  client?: AuthClient;
};

export type LoginRequest = {
  email: string;
  password: string;
  role?: UserRole | 'Admin';
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
