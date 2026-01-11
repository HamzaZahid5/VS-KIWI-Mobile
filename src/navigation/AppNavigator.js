/**
 * Main App Navigator
 * Configures React Navigation with Stack Navigator for auth and nested Bottom Tab Navigator for main app
 */

import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { colors } from '../theme';
import { selectIsAuthenticated } from '../redux/authSlice';

// Import bottom tab navigator
import BottomTabNavigator from './BottomTabNavigator';

// Import detail screens (stack screens navigated from tabs)
import BookingDetailsScreen from '../screens/BookingDetails/BookingDetailsScreen';
import PaymentScreen from '../screens/Payment/PaymentScreen';
import SettingsScreen from '../screens/SettingsScreen';
import BookingScreen from '../screens/Booking/BookingScreen';
import ExtendBookingScreen from '../screens/Booking/ExtendBookingScreen';
import BookingHistoryScreen from '../screens/BookingHistory/BookingHistoryScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SeeAllBookingsScreen from '../screens/SeeAllBookings/SeeAllBookingsScreen';

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
const AppNavigator = ({ initialAuthState }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigationRef = useRef(null);
  const hasCheckedInitialRoute = useRef(false);
  
  // Use initialAuthState prop if available, otherwise use selector
  const currentAuthState = initialAuthState !== undefined ? initialAuthState : isAuthenticated;

  // Handle initial route and auth state changes
  useEffect(() => {
    if (!navigationRef.current?.isReady()) return;
    
    const currentRoute = navigationRef.current.getCurrentRoute();
    
    // On initial mount, navigate to correct screen based on auth state
    if (!hasCheckedInitialRoute.current) {
      hasCheckedInitialRoute.current = true;
      
      if (currentAuthState) {
        // User is authenticated, go to MainTabs (bottom tab navigator)
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
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
    if (!isAuthenticated && currentRoute?.name !== 'Login' && !currentRoute?.name?.includes('Auth')) {
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
    // If authenticated and on Login screen, navigate to MainTabs
    else if (isAuthenticated && currentRoute?.name === 'Login') {
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    }
  }, [isAuthenticated, currentAuthState]);

  return (
    <NavigationContainer 
      ref={navigationRef}
      onReady={() => {
        // Navigation is ready, check auth state and navigate
        if (!hasCheckedInitialRoute.current && navigationRef.current?.isReady()) {
          hasCheckedInitialRoute.current = true;
          
          if (isAuthenticated) {
            // User is authenticated, go to MainTabs (bottom tab navigator)
            navigationRef.current.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
          }
          // If not authenticated, initialRouteName="Login" will handle it
        }
      }}
    >
      <Stack.Navigator
        initialRouteName={currentAuthState ? "MainTabs" : "Login"}
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

        {/* Main App - Bottom Tab Navigator */}
        <Stack.Screen
          name="MainTabs"
          component={BottomTabNavigator}
          options={{
            headerShown: false,
          }}
        />

        {/* Detail Screens - Stack screens navigated from tabs */}
        <Stack.Screen
          name="NewBooking"
          component={BookingScreen}
          options={{
            headerShown: false, // BookingScreen has its own header
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
        <Stack.Screen
          name="ExtendBooking"
          component={ExtendBookingScreen}
          options={{
            headerShown: false, // ExtendBooking screen has its own header
          }}
        />
        <Stack.Screen
          name="BookingHistory"
          component={BookingHistoryScreen}
          options={{
            headerShown: false, // BookingHistory screen has its own header
          }}
        />
        <Stack.Screen
          name="Preferences"
          component={PreferencesScreen}
          options={{
            headerShown: false, // Preferences screen has its own header
          }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{
            headerShown: false, // EditProfile screen has its own header
          }}
        />
        <Stack.Screen
          name="SeeAllBookings"
          component={SeeAllBookingsScreen}
          options={{
            headerShown: false, // SeeAllBookings screen has its own header
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

