/**
 * Main App Component
 * Entry point of the React Native Expo application
 * Sets up Redux Provider and Navigation
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { store, persistor } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme';

/**
 * Loading component shown while Redux state is being rehydrated
 */
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

/**
 * Main App component
 * Wraps the app with Redux Provider and PersistGate for state persistence
 */
export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <AppNavigator />
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

