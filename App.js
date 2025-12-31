/**
 * Main App Component
 * Entry point of the React Native Expo application
 * Sets up Redux Provider and Navigation
 */

import React, { useEffect, useState } from "react";
import { StatusBar, View } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import * as SplashScreen from "expo-splash-screen";
import { StripeProvider } from "@stripe/stripe-react-native";
import * as Linking from "expo-linking";
import Constants from "expo-constants";
import { store, persistor } from "./src/redux/store";
import AppNavigator from "./src/navigation/AppNavigator";
import { colors } from "./src/theme";
import { STRIPE_PUBLIC_KEY } from "./src/utils/constants";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

/**
 * Main App component
 * Wraps the app with Redux Provider and PersistGate for state persistence
 */
export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Wait exactly 3 seconds before hiding splash screen
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Hide the splash screen
        await SplashScreen.hideAsync();

        // Set app ready
        setAppIsReady(true);
      } catch (e) {
        console.warn("App preparation error:", e);
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Show nothing until app is ready (splash screen will be visible)
  if (!appIsReady) {
    return null;
  }

  // Get URL scheme for Stripe redirects
  const getUrlScheme = () => {
    if (Constants.appOwnership === "expo") {
      return Linking.createURL("/--/");
    }
    return Linking.createURL("");
  };

  // Render the app after splash screen is hidden
  return (
    <View style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <StripeProvider
            publishableKey={STRIPE_PUBLIC_KEY || ""}
            merchantIdentifier=""
            urlScheme={getUrlScheme()}
          >
            <StatusBar
              barStyle="light-content"
              translucent={false}
              backgroundColor={colors.primary}
            />
            <AppNavigator />
          </StripeProvider>
        </PersistGate>
      </Provider>
    </View>
  );
}
