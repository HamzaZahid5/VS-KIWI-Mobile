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
import HomeScreen from '../screens/Home/HomeScreen';
import BookingScreen from '../screens/Booking/BookingScreen';
import BookingDetailsScreen from '../screens/BookingDetails/BookingDetailsScreen';
import PaymentScreen from '../screens/Payment/PaymentScreen';
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
  const hasCheckedInitialRoute = useRef(false);

  // Handle initial route and auth state changes
  useEffect(() => {
    if (!navigationRef.current?.isReady()) return;
    
    const currentRoute = navigationRef.current.getCurrentRoute();
    
    // On initial mount, navigate to correct screen based on auth state
    if (!hasCheckedInitialRoute.current) {
      hasCheckedInitialRoute.current = true;
      
      if (isAuthenticated) {
        // User is authenticated, go to Home
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        // User is not authenticated, go to Login
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
      return;
    }
    
    // After initial mount, handle auth state changes
    // If not authenticated and not on Login screen, navigate to Login
    if (!isAuthenticated && currentRoute?.name !== 'Login') {
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
    // If authenticated and on Login screen, navigate to Home
    else if (isAuthenticated && currentRoute?.name === 'Login') {
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  }, [isAuthenticated]);

  return (
    <NavigationContainer 
      ref={navigationRef}
      onReady={() => {
        // Navigation is ready, check auth state and navigate
        if (!hasCheckedInitialRoute.current && navigationRef.current?.isReady()) {
          hasCheckedInitialRoute.current = true;
          
          if (isAuthenticated) {
            // User is authenticated, go to Home
            navigationRef.current.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          }
          // If not authenticated, initialRouteName="Login" will handle it
        }
      }}
    >
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
            headerShown: false, // Home screen has its own header matching web app
          }}
        />
        <Stack.Screen
          name="Booking"
          component={BookingScreen}
          options={{
            headerShown: false, // Booking screen has its own header
          }}
        />
        <Stack.Screen
          name="BookingDetails"
          component={BookingDetailsScreen}
          options={{
            headerShown: false, // BookingDetails screen has its own header
          }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{
            headerShown: false, // Payment screen has its own header
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.primary,
              elevation: 0,
              shadowOpacity: 0,
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
              elevation: 0,
              shadowOpacity: 0,
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

