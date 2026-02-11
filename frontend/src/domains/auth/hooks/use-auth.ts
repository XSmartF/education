import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { authApi } from '../api/auth-api';
import { clearSession, setAuthenticated } from '../store/auth-slice';

type UseAuthResult = {
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  setAuthenticated: (value: boolean) => void;
  signOut: () => Promise<void>;
};

export function useAuth(): UseAuthResult {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isBootstrapping = useAppSelector((state) => state.auth.bootstrapping ?? false);
  const dispatch = useAppDispatch();

  const updateAuth = (value: boolean) => {
    dispatch(setAuthenticated(value));
  };

  const signOut = async () => {
    try {
      await authApi.revoke();
    } finally {
      dispatch(clearSession());
    }
  };

  return {
    isAuthenticated,
    isBootstrapping,
    setAuthenticated: updateAuth,
    signOut,
  };
}
