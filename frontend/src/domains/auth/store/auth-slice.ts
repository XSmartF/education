import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AuthState = {
  isAuthenticated: boolean;
  accessToken?: string | null;
  refreshToken?: string | null;
  bootstrapping?: boolean;
};

const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  bootstrapping: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
      state.bootstrapping = false;
    },
    setBootstrapping: (state, action: PayloadAction<boolean>) => {
      state.bootstrapping = action.payload;
    },
    setTokens: (
      state,
      action: PayloadAction<{ accessToken?: string | null; refreshToken?: string | null }>
    ) => {
      state.accessToken = action.payload.accessToken ?? null;
      state.refreshToken = action.payload.refreshToken ?? null;
    },
    clearSession: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.bootstrapping = false;
    },
  },
});

export const { setAuthenticated, setTokens, clearSession, setBootstrapping } = authSlice.actions;
export default authSlice.reducer;
