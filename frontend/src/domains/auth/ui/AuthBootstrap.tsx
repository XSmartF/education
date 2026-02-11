import { useEffect } from 'react';
import { useAppDispatch } from '@/app/store/hooks';
import { clearSession, setAuthenticated, setBootstrapping } from '@/domains/auth/store/auth-slice';
import { refreshAccessToken, registerAuthStateHandler } from '@/shared/api/http-client';

export function AuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setBootstrapping(true));
    registerAuthStateHandler((isAuthenticated) => {
      if (isAuthenticated) {
        dispatch(setAuthenticated(true));
      } else {
        dispatch(clearSession());
      }
      dispatch(setBootstrapping(false));
    });

    void refreshAccessToken();
  }, [dispatch]);

  return null;
}
