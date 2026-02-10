import { useEffect } from 'react';
import { useAppDispatch } from '@/app/store/hooks';
import { clearSession, setAuthenticated } from '@/domains/auth/store/auth-slice';
import { refreshAccessToken, registerAuthStateHandler } from '@/shared/api/http-client';

export function AuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    registerAuthStateHandler((isAuthenticated) => {
      if (isAuthenticated) {
        dispatch(setAuthenticated(true));
      } else {
        dispatch(clearSession());
      }
    });

    void refreshAccessToken();
  }, [dispatch]);

  return null;
}
