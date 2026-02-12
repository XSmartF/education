import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { tokenStore } from '@/shared/api/http-client';
import { authApi } from '../api/auth-api';

type AuthSession = {
  accessToken: string;
  refreshToken: string;
};

type UseAuthResult = {
  token: string;
  roles: string[];
  isAuthenticated: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  loading: boolean;
  saveSession: (session: AuthSession) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<UseAuthResult | null>(null);

const decodeJwtPayload = (token: string) => {
  const parts = token.split('.');
  if (parts.length < 2 || !('atob' in globalThis)) {
    return null;
  }

  const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');

  try {
    const decoded = globalThis.atob(padded);
    const payload = decodeURIComponent(
      decoded
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const getTokenRoles = (token: string) => {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return [];
  }

  const roleValue =
    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
    payload.role ??
    payload.roles;

  if (Array.isArray(roleValue)) {
    return roleValue.filter((value): value is string => Object.prototype.toString.call(value) === '[object String]');
  }

  if (Object.prototype.toString.call(roleValue) === '[object String]') {
    return [String(roleValue)];
  }

  return [];
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tokenStore
      .getAccess()
      .then((value) => setToken(value ?? ''))
      .finally(() => setLoading(false));
  }, []);

  const saveSession = async (session: AuthSession) => {
    await tokenStore.setAccess(session.accessToken);
    await tokenStore.setRefresh(session.refreshToken);
    setToken(session.accessToken);
  };

  const signOut = async () => {
    const refreshToken = await tokenStore.getRefresh();
    try {
      await authApi.revoke(refreshToken ?? undefined);
    } finally {
      await tokenStore.clear();
      setToken('');
    }
  };

  const roles = useMemo(() => getTokenRoles(token), [token]);
  const isAdmin = roles.includes('Admin');
  const isStaff = roles.some((role) => role === 'Admin' || role === 'Teacher' || role === 'Organize');

  const value = useMemo<UseAuthResult>(
    () => ({
      token,
      roles,
      isAuthenticated: token.length > 0,
      isStaff,
      isAdmin,
      loading,
      saveSession,
      signOut,
    }),
    [isAdmin, isStaff, loading, roles, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): UseAuthResult {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
