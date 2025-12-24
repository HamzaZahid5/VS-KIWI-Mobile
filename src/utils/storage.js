/**
 * Storage Utility Functions
 * Wrapper functions for AsyncStorage operations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';

/**
 * Store data in AsyncStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store (will be stringified)
 * @returns {Promise} Promise that resolves when data is stored
 */
export const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error('Error storing data:', error);
    return false;
  }
};

/**
 * Retrieve data from AsyncStorage
 * @param {string} key - Storage key
 * @returns {Promise} Promise that resolves with the stored value
 */
export const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error retrieving data:', error);
    return null;
  }
};

/**
 * Remove data from AsyncStorage
 * @param {string} key - Storage key
 * @returns {Promise} Promise that resolves when data is removed
 */
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing data:', error);
    return false;
  }
};

/**
 * Clear all data from AsyncStorage
 * @returns {Promise} Promise that resolves when all data is cleared
 */
export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

/**
 * Store authentication token
 * @param {string} token - Auth token
 * @returns {Promise} Promise that resolves when token is stored
 */
export const storeAuthToken = async (token) => {
  return storeData(STORAGE_KEYS.AUTH_TOKEN, token);
};

/**
 * Get authentication token
 * @returns {Promise} Promise that resolves with the auth token
 */
export const getAuthToken = async () => {
  return getData(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Remove authentication token
 * @returns {Promise} Promise that resolves when token is removed
 */
export const removeAuthToken = async () => {
  return removeData(STORAGE_KEYS.AUTH_TOKEN);
};

