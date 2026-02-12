import {
  configureStore,
  createListenerMiddleware,
  type EnhancedStore,
  type TypedStartListening,
} from '@reduxjs/toolkit';
import authReducer, { type AuthState } from '@/domains/auth/store/auth-slice';

const listenerMiddleware = createListenerMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: true,
    }).prepend(listenerMiddleware.middleware),
  devTools: import.meta.env.MODE === 'development',
});

export type RootState = { auth: AuthState };
export type AppStore = EnhancedStore<RootState>;
export type AppDispatch = AppStore['dispatch'];

export type AppStartListening = TypedStartListening<RootState, AppDispatch>;
export const startAppListening = listenerMiddleware.startListening as AppStartListening;
