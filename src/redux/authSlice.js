/**
 * Auth Redux Slice
 * Manages authentication state (token, user, isAuthenticated)
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setRefreshToken: (state, action) => {
      state.refreshToken = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setAuth: (state, action) => {
      const { token, user, refreshToken } = action.payload;
      state.token = token;
      state.user = user;
      state.refreshToken = refreshToken || null;
      state.isAuthenticated = !!token;
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
    },
    clearAuth: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setToken, setRefreshToken, setUser, setAuth, logout, clearAuth } = authSlice.actions;

// Selectors
export const selectToken = (state) => state.auth.token;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export default authSlice.reducer;

