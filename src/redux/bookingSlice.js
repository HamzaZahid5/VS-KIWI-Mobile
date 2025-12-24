/**
 * Redux Toolkit slice for managing booking data
 * Handles booking state, actions, and reducers
 */

import { createSlice } from '@reduxjs/toolkit';

// Initial state for bookings
const initialState = {
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null,
};

/**
 * Booking slice with reducers for managing booking state
 */
const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    // Add a new booking to the list
    addBooking: (state, action) => {
      state.bookings.push({
        ...action.payload,
        id: action.payload.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
      });
    },
    
    // Remove a booking by ID
    removeBooking: (state, action) => {
      state.bookings = state.bookings.filter(
        (booking) => booking.id !== action.payload
      );
    },
    
    // Update an existing booking
    updateBooking: (state, action) => {
      const index = state.bookings.findIndex(
        (booking) => booking.id === action.payload.id
      );
      if (index !== -1) {
        state.bookings[index] = {
          ...state.bookings[index],
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    // Set the current booking being viewed/edited
    setCurrentBooking: (state, action) => {
      state.currentBooking = action.payload;
    },
    
    // Clear the current booking
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    
    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    // Clear all bookings
    clearAllBookings: (state) => {
      state.bookings = [];
      state.currentBooking = null;
    },
  },
});

// Export actions
export const {
  addBooking,
  removeBooking,
  updateBooking,
  setCurrentBooking,
  clearCurrentBooking,
  setLoading,
  setError,
  clearAllBookings,
} = bookingSlice.actions;

// Export selectors
export const selectAllBookings = (state) => state.booking.bookings;
export const selectCurrentBooking = (state) => state.booking.currentBooking;
export const selectBookingById = (state, bookingId) =>
  state.booking.bookings.find((booking) => booking.id === bookingId);
export const selectBookingLoading = (state) => state.booking.loading;
export const selectBookingError = (state) => state.booking.error;

// Export reducer
export default bookingSlice.reducer;

