/**
 * Booking Flow Redux Slice
 * Manages multi-step booking process state
 */

import { createSlice } from '@reduxjs/toolkit';

const STEPS = ['location', 'type', 'details', 'payment', 'confirm'];
const HOURLY_RATE = 10;
const SIZE_MULTIPLIERS = {
  small: 0.7,
  medium: 1,
  large: 1.4,
};

const initialState = {
  step: 'location',
  bookingData: {
    beachId: '',
    bookingType: 'order_now', // 'order_now' or 'pre_book'
    selectedSizes: [], // [{ size: 'small', quantity: 1 }]
    durationHours: 0,
    scheduledDate: null,
    scheduledTime: '',
    latitude: 0,
    longitude: 0,
    paymentMethod: 'stripe', // 'stripe' or 'cod'
    termsAccepted: false,
  },
  hourlyRate: HOURLY_RATE,
  sizeMultipliers: SIZE_MULTIPLIERS,
};

const bookingFlowSlice = createSlice({
  name: 'bookingFlow',
  initialState,
  reducers: {
    // Navigation
    setStep: (state, action) => {
      state.step = action.payload;
    },
    nextStep: (state) => {
      const currentIndex = STEPS.indexOf(state.step);
      if (currentIndex < STEPS.length - 1) {
        state.step = STEPS[currentIndex + 1];
      }
    },
    prevStep: (state) => {
      const currentIndex = STEPS.indexOf(state.step);
      if (currentIndex > 0) {
        state.step = STEPS[currentIndex - 1];
      }
    },
    goToStep: (state, action) => {
      const targetStep = action.payload;
      const currentIndex = STEPS.indexOf(state.step);
      const targetIndex = STEPS.indexOf(targetStep);
      if (targetIndex <= currentIndex) {
        state.step = targetStep;
      }
    },
    reset: (state, action) => {
      const preSelectedBeach = action?.payload?.preSelectedBeach;
      const preSelectedType = action?.payload?.preSelectedType;
      state.step = 'location';
      state.bookingData = {
        ...initialState.bookingData,
        beachId: preSelectedBeach || '',
        bookingType: preSelectedType === 'pre_book' ? 'pre_book' : 'order_now',
      };
    },

    // Location
    setBeachId: (state, action) => {
      state.bookingData.beachId = action.payload;
    },
    setLocation: (state, action) => {
      state.bookingData.latitude = action.payload.latitude;
      state.bookingData.longitude = action.payload.longitude;
    },

    // Booking Type
    setBookingType: (state, action) => {
      state.bookingData.bookingType = action.payload;
      // Reset payment to stripe if switching to pre_book with COD selected
      if (action.payload === 'pre_book' && state.bookingData.paymentMethod === 'cod') {
        state.bookingData.paymentMethod = 'stripe';
      }
    },
    setScheduledDate: (state, action) => {
      state.bookingData.scheduledDate = action.payload;
    },
    setScheduledTime: (state, action) => {
      state.bookingData.scheduledTime = action.payload;
    },

    // Details
    toggleSize: (state, action) => {
      const size = action.payload;
      const index = state.bookingData.selectedSizes.findIndex(sq => sq.size === size);
      if (index >= 0) {
        state.bookingData.selectedSizes.splice(index, 1);
      } else {
        state.bookingData.selectedSizes.push({ size, quantity: 1 });
      }
    },
    setQuantity: (state, action) => {
      const { size, quantity } = action.payload;
      const index = state.bookingData.selectedSizes.findIndex(sq => sq.size === size);
      if (index >= 0) {
        state.bookingData.selectedSizes[index].quantity = quantity;
      }
    },
    setDuration: (state, action) => {
      state.bookingData.durationHours = action.payload;
    },

    // Payment
    setPaymentMethod: (state, action) => {
      state.bookingData.paymentMethod = action.payload;
    },

    // Confirmation
    setTermsAccepted: (state, action) => {
      state.bookingData.termsAccepted = action.payload;
    },
  },
});

export const {
  setStep,
  nextStep,
  prevStep,
  goToStep,
  reset,
  setBeachId,
  setLocation,
  setBookingType,
  setScheduledDate,
  setScheduledTime,
  toggleSize,
  setQuantity,
  setDuration,
  setPaymentMethod,
  setTermsAccepted,
} = bookingFlowSlice.actions;

// Selectors
export const selectStep = (state) => state.bookingFlow.step;
export const selectBookingData = (state) => state.bookingFlow.bookingData;
export const selectHourlyRate = (state) => state.bookingFlow.hourlyRate;
export const selectSizeMultipliers = (state) => state.bookingFlow.sizeMultipliers;

// Computed selectors
export const selectStepIndex = (state) => {
  return STEPS.indexOf(state.bookingFlow.step) + 1;
};

export const selectBasePrice = (state) => {
  const { selectedSizes, durationHours } = state.bookingFlow.bookingData;
  const hourlyRate = state.bookingFlow.hourlyRate;
  const multipliers = state.bookingFlow.sizeMultipliers;

  return selectedSizes.reduce((total, sq) => {
    const multiplier = multipliers[sq.size] || 1;
    const rate = hourlyRate * multiplier;
    return total + (rate * durationHours * sq.quantity);
  }, 0);
};

export const selectTotalPrice = (state) => {
  return selectBasePrice(state); // Can add discount/promotion logic here
};

export const selectOrderPayload = (state) => {
  const { bookingData } = state.bookingFlow;
  const payload = {
    beachId: bookingData.beachId,
    bookingType: bookingData.bookingType,
    selectedSizes: bookingData.selectedSizes,
    durationHours: bookingData.durationHours,
    deliveryLatitude: bookingData.latitude.toString(),
    deliveryLongitude: bookingData.longitude.toString(),
    paymentMethod: bookingData.paymentMethod,
  };

  if (bookingData.bookingType === 'pre_book' && bookingData.scheduledDate && bookingData.scheduledTime) {
    // Handle Date object serialization
    const date = bookingData.scheduledDate instanceof Date 
      ? bookingData.scheduledDate 
      : new Date(bookingData.scheduledDate);
    payload.scheduledDate = date.toISOString();
    payload.scheduledTime = bookingData.scheduledTime;
  }

  return payload;
};

export default bookingFlowSlice.reducer;

