/**
 * Main App Navigator
 * Configures React Navigation Stack Navigator for the app
 */

import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { colors } from '../theme';
import { selectIsAuthenticated } from '../redux/authSlice';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import BookingScreen from '../screens/BookingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Import auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import OTPLoginScreen from '../screens/auth/OTPLoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import AdminLoginScreen from '../screens/auth/AdminLoginScreen';

// Create stack navigator
const Stack = createStackNavigator();

/**
 * Main App Navigator component
 * Wraps all screens in a Stack Navigator with consistent styling
 * Checks authentication state and navigates to Login if not authenticated
 */
const AppNavigator = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigationRef = useRef(null);

  // Navigate to Login if not authenticated (after initial mount)
  useEffect(() => {
    // Small delay to ensure navigation is ready
    const timer = setTimeout(() => {
      if (!isAuthenticated && navigationRef.current?.isReady()) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false, // Auth screens have custom headers
        }}
      >
        {/* Auth Screens */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OTPLogin"
          component={OTPLoginScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AdminLogin"
          component={AdminLoginScreen}
          options={{
            headerShown: false,
          }}
        />

        {/* Main App Screens */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.textWhite,
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 18,
            },
            headerBackTitleVisible: false,
            title: 'Kiwi Rentals',
          }}
        />
        <Stack.Screen
          name="Booking"
          component={BookingScreen}
          options={{
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.textWhite,
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 18,
            },
            headerBackTitleVisible: false,
            title: 'My Bookings',
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.textWhite,
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 18,
            },
            headerBackTitleVisible: false,
            title: 'Profile',
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.textWhite,
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 18,
            },
            headerBackTitleVisible: false,
            title: 'Settings',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

