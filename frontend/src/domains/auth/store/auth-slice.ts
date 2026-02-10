import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AuthState = {
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    clearSession: (state) => {
      state.isAuthenticated = false;
    },
  },
});

export const { setAuthenticated, clearSession } = authSlice.actions;
export default authSlice.reducer;
