import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AuthState = {
  isAuthenticated: boolean;
  accessToken?: string | null;
  refreshToken?: string | null;
};

const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
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
    },
  },
});

export const { setAuthenticated, setTokens, clearSession } = authSlice.actions;
export default authSlice.reducer;
