import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import slices
import authSlice from './slices/authSlice';
import categorySlice from './slices/categorySlice';
import transactionSlice from './slices/transactionSlice';
import uiSlice from './slices/uiSlice';
import budgetSlice from './slices/budgetSlice';
import notificationSlice from './slices/notificationSlice';
import settingsSlice from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    categories: categorySlice,
    transactions: transactionSlice,
    ui: uiSlice,
    budgets: budgetSlice,
    notifications: notificationSlice,
    settings: settingsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;