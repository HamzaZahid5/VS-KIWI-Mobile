/**
 * API Utility Functions
 * Functions for making API calls and handling responses
 */

import { Platform } from 'react-native';
import { API_CONFIG, ERROR_MESSAGES } from "./constants";
import { getAuthToken } from "./storage";

/**
 * Get headers with auth token if available
 * @returns {Promise<object>} Headers object
 */
const getHeaders = async () => {
  const headers = {
    "Content-Type": "application/json",
  };

  const token = await getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Make a GET request
 * @param {string} endpoint - API endpoint
 * @param {object} params - Query parameters
 * @returns {Promise} API response
 */
export const get = async (endpoint, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_CONFIG.BASE_URL}${endpoint}${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: await getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || ERROR_MESSAGES.NETWORK_ERROR);
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || ERROR_MESSAGES.NETWORK_ERROR);
  }
};

/**
 * Make a POST request
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body data
 * @returns {Promise} API response
 */
export const post = async (endpoint, data = {}) => {
  try {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: await getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `Server error: ${response.status}`;
      } catch (e) {
        errorMessage = `Network request failed: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    // Provide more helpful error messages for network issues
    if (error.message.includes('Network request failed') || 
        error.message.includes('Failed to fetch') ||
        error.message === ERROR_MESSAGES.NETWORK_ERROR) {
      let helpText = 'Cannot connect to server.\n\n';
      helpText += 'Please check:\n';
      helpText += '1. Server is running on port 5000\n';
      helpText += '2. Network connection\n';
      if (Platform.OS === 'android') {
        helpText += '\nAndroid emulator uses: http://10.0.2.2:5000/api\n';
        helpText += 'If using physical device, use your computer\'s IP address';
      } else {
        helpText += '\nCurrent API URL: ' + API_CONFIG.BASE_URL;
      }
      throw new Error(helpText);
    }
    throw error;
  }
};

/**
 * Make a PUT request
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body data
 * @returns {Promise} API response
 */
export const put = async (endpoint, data = {}) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: await getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || ERROR_MESSAGES.NETWORK_ERROR);
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || ERROR_MESSAGES.NETWORK_ERROR);
  }
};

/**
 * Make a PATCH request (matching web app's updateData)
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body data
 * @returns {Promise} API response
 */
export const patch = async (endpoint, data = {}) => {
  try {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      method: "PATCH",
      headers: await getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `Server error: ${response.status}`;
      } catch (e) {
        errorMessage = `Network request failed: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    // Provide more helpful error messages for network issues
    if (error.message.includes('Network request failed') || 
        error.message.includes('Failed to fetch') ||
        error.message === ERROR_MESSAGES.NETWORK_ERROR) {
      let helpText = 'Cannot connect to server.\n\n';
      helpText += 'Please check:\n';
      helpText += '1. Server is running\n';
      helpText += '2. Network connection\n';
      if (Platform.OS === 'android') {
        helpText += '\nAndroid emulator uses: http://10.0.2.2:5000/api\n';
        helpText += 'If using physical device, use your computer\'s IP address';
      } else {
        helpText += '\nCurrent API URL: ' + API_CONFIG.BASE_URL;
      }
      throw new Error(helpText);
    }
    throw error;
  }
};

/**
 * Make a DELETE request
 * @param {string} endpoint - API endpoint
 * @returns {Promise} API response
 */
export const del = async (endpoint) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: await getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || ERROR_MESSAGES.NETWORK_ERROR);
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || ERROR_MESSAGES.NETWORK_ERROR);
  }
};
