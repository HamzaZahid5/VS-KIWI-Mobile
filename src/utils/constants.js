/**
 * Application Constants
 * Centralized constants used throughout the app
 */

// API Configuration
// For Android emulator: use 10.0.2.2 instead of localhost
// For iOS simulator: use localhost (works fine)
// For physical devices: use your computer's local IP address (e.g., 192.168.1.100:5000/api)
// You can set EXPO_PUBLIC_API_URL environment variable to override this
import { Platform } from "react-native";

const getBaseURL = () => {
  //   // Check if environment variable is set
  //   if (process.env.EXPO_PUBLIC_API_URL) {
  //     return process.env.EXPO_PUBLIC_API_URL;
  //   }

  //   // Auto-detect Android emulator and use 10.0.2.2
  //   // For iOS simulator, localhost works fine
  //   if (Platform.OS === 'android') {
  //     // Android emulator uses 10.0.2.2 to access host machine's localhost
  //     return 'http://10.0.2.2:5000/api';
  //   }

  //   // iOS simulator and web can use localhost
  //   return 'http://localhost:5000/api';

  return "https://kiwi-rentals.vercel.app/api";
};

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  TIMEOUT: 30000,
  ENDPOINTS: {
    BOOKINGS: "/bookings",
    PROPERTIES: "/properties",
    USERS: "/users",
    AUTH: "/auth",
  },
};

// Auth Endpoints - matching web app
export const AUTH_ENDPOINTS = {
  user: "/users/me",
  login: "/auth/login",
  adminLogin: "/auth/admin/login",
  signup: "/auth/signup",
  google: "/auth/google",
  apple: "/auth/apple",
  logout: "/auth/logout",
  refresh: "/auth/refresh",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
};

// OTP Endpoints - matching web app
export const OTP_ENDPOINTS = {
  send: "/auth/send-otp",
  verify: "/auth/verify-otp",
};

// Google Maps API Key - Set via environment variable or provide directly
// For Expo: Use EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
// For production, use environment variable for security
export const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || null;
// EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

// Stripe Public Key - Set via environment variable
// For Expo: Use EXPO_PUBLIC_STRIPE_PUBLIC_KEY
// Get this from your Stripe Dashboard: https://dashboard.stripe.com/apikeys
export const STRIPE_PUBLIC_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY || null;
// export const STRIPE_SECRET_KEY =
//   "sk_test_51SewdRGtz4AlaiVxi5l5ycygQO2loGmg70mRU3rmRPUWS9cXlfsWboEzfIQCoaFalK7OyHocmH7IrHqKfz9vZ8dP00gCHpLUeP";

export const STRIPE_SECRET_KEY = process.env.EXPO_SECRET_KEY || null;
// Beaches Endpoints - matching web app
export const beachesEndpoints = {
  list: "/beaches",
  getById: (id) => `/beaches/${id}`,
};

// Orders Endpoints - matching web app
export const ordersEndpoints = {
  list: "/orders",
  active: "/orders/active",
  myOrders: "/orders/my-orders",
  stats: "/orders/stats",
  getById: (id) => `/orders/${id}`,
  create: "/orders",
  extend: (id) => `/orders/${id}/extend`,
};

// Payment Endpoints
export const paymentEndpoints = {
  createPaymentIntent: "/payment/create-payment-intent",
  confirmPayment: "/payment/confirm-payment",
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "@kiwi:auth_token",
  USER_DATA: "@kiwi:user_data",
  SETTINGS: "@kiwi:settings",
  BOOKINGS: "@kiwi:bookings",
};

// Booking Status
export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "Unauthorized. Please login again.",
  NOT_FOUND: "Resource not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  BOOKING_CREATED: "Booking created successfully!",
  BOOKING_UPDATED: "Booking updated successfully!",
  BOOKING_DELETED: "Booking deleted successfully!",
  PROFILE_UPDATED: "Profile updated successfully!",
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: "MMM DD, YYYY",
  INPUT: "YYYY-MM-DD",
  DATETIME: "MMM DD, YYYY HH:mm",
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
};
