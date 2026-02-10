import {
  configureStore,
  createListenerMiddleware,
  type TypedStartListening,
} from '@reduxjs/toolkit';
import authReducer from '@/domains/auth/store/auth-slice';

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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

export type AppStartListening = TypedStartListening<RootState, AppDispatch>;
export const startAppListening = listenerMiddleware.startListening as AppStartListening;