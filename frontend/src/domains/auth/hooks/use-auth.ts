import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { authApi } from '../api/auth-api';
import { clearSession, setAuthenticated } from '../store/auth-slice';
import { getTokenRoles, isStaffRole } from '@/shared/security/jwt';

type UseAuthResult = {
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  roles: string[];
  isStaff: boolean;
  isAdmin: boolean;
  setAuthenticated: (value: boolean) => void;
  signOut: () => Promise<void>;
};

export function useAuth(): UseAuthResult {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isBootstrapping = useAppSelector((state) => state.auth.bootstrapping ?? false);
  const accessToken = useAppSelector((state) => state.auth.accessToken ?? '');
  const dispatch = useAppDispatch();
  const roles = useMemo(() => (accessToken ? getTokenRoles(accessToken) : []), [accessToken]);
  const isAdmin = roles.includes('Admin');
  const isStaff = roles.some((role) => isStaffRole(role));

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
    roles,
    isStaff,
    isAdmin,
    setAuthenticated: updateAuth,
    signOut,
  };
}
