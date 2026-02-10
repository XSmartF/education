import { useEffect, useState } from 'react';
import { tokenStore } from '@/shared/api/http-client';
import { authApi } from '../api/auth-api';

type AuthSession = {
  accessToken: string;
  refreshToken: string;
};

type UseAuthResult = {
  token: string;
  isAuthenticated: boolean;
  loading: boolean;
  saveSession: (session: AuthSession) => Promise<void>;
  signOut: () => Promise<void>;
};

export function useAuth(): UseAuthResult {
  const [token, setToken] = useState<string>('');
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

  return {
    token,
    isAuthenticated: token.length > 0,
    loading,
    saveSession,
    signOut,
  };
}
