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

// Create a storage adapter that handles iOS folder creation errors
const createStorage = () => {
  return {
    getItem: async (key) => {
      try {
        return await AsyncStorage.getItem(key);
      } catch (error) {
        // Suppress iOS folder creation errors
        if (error?.message?.includes("doesn't exist") || error?.code === 4) {
          return null;
        }
        throw error;
      }
    },
    setItem: async (key, value) => {
      try {
        await AsyncStorage.setItem(key, value);
      } catch (error) {
        // Suppress iOS folder creation errors - folder will be created automatically
        if (error?.message?.includes("doesn't exist") || 
            error?.code === 4 || 
            error?.domain === 'NSCocoaErrorDomain') {
          // Retry once after a short delay to allow folder creation
          await new Promise(resolve => setTimeout(resolve, 50));
          try {
            await AsyncStorage.setItem(key, value);
          } catch (retryError) {
            // If retry also fails, silently fail (non-critical for redux-persist)
            // The data will be saved on next state change
            return;
          }
        } else {
          throw error;
        }
      }
    },
    removeItem: async (key) => {
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        // Suppress iOS folder errors
        if (error?.message?.includes("doesn't exist") || error?.code === 4) {
          return;
        }
        throw error;
      }
    },
  };
};

// Redux-persist configuration
const persistConfig = {
  key: 'root',
  storage: createStorage(),
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

