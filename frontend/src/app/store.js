import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import taxReducer from '../features/tax/taxSlice';
import paymentReducer from '../features/payment/paymentSlice';
import documentReducer from '../features/document/documentSlice';
import notificationReducer from '../features/notification/notificationSlice';
import propertyReducer from '../features/property/propertySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tax: taxReducer,
    payment: paymentReducer,
    document: documentReducer,
    notification: notificationReducer,
    property: propertyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
