/**
 * Validation Helper Functions
 * Utility functions for form validation and data validation
 */

import { isValidPhoneNumber } from 'libphonenumber-js';

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number using libphonenumber-js (same as web app)
 * @param {string} phone - Phone number to validate (should include country code, e.g., +971501234567)
 * @returns {boolean} True if phone is valid
 */
export const isValidPhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return false;
  }
  try {
    return isValidPhoneNumber(phone);
  } catch (error) {
    return false;
  }
};

/**
 * Validate required field
 * @param {string} value - Value to validate
 * @returns {boolean} True if value is not empty
 */
export const isRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

/**
 * Validate minimum length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length required
 * @returns {boolean} True if value meets minimum length
 */
export const hasMinLength = (value, minLength) => {
  return value && value.toString().length >= minLength;
};

/**
 * Validate maximum length
 * @param {string} value - Value to validate
 * @param {number} maxLength - Maximum length allowed
 * @returns {boolean} True if value is within maximum length
 */
export const hasMaxLength = (value, maxLength) => {
  return value && value.toString().length <= maxLength;
};

/**
 * Validate numeric value
 * @param {string|number} value - Value to validate
 * @returns {boolean} True if value is numeric
 */
export const isNumeric = (value) => {
  return !isNaN(value) && !isNaN(parseFloat(value));
};

/**
 * Validate date range (check if end date is after start date)
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {boolean} True if end date is after start date
 */
export const isValidDateRange = (startDate, endDate) => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  return end > start;
};

