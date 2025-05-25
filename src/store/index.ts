import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import shipmentsReducer from './slices/shipmentsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    shipments: shipmentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 