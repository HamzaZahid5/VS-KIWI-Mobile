/**
 * Redux store configuration
 * Sets up Redux Toolkit store with redux-persist for local storage
 */

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';
import bookingReducer from './bookingSlice';
import bookingFlowReducer from './bookingFlowSlice';
import authReducer from './authSlice';

// Redux-persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // Persist booking, bookingFlow and auth data
  whitelist: ['booking', 'bookingFlow', 'auth'],
  // Transform to exclude non-serializable data
  transforms: [],
};

// Combine all reducers
const rootReducer = combineReducers({
  booking: bookingReducer,
  bookingFlow: bookingFlowReducer,
  auth: authReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Configure and export the Redux store
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Export persistor for PersistGate
export const persistor = persistStore(store);

