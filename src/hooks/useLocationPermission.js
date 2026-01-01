/**
 * React Hook for Location Permission
 * Provides easy access to location permission status and functions
 */

import { useState, useEffect } from "react";
import {
  checkLocationPermission,
  requestLocationPermission,
  getCurrentLocation,
} from "../utils/locationPermission";

/**
 * Hook to manage location permission
 * @returns {Object} { hasPermission, requestPermission, getLocation, isLoading }
 */
export const useLocationPermission = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      setIsLoading(true);
      const granted = await checkLocationPermission();
      setHasPermission(granted);
    } catch (error) {
      console.error("Error checking location permission:", error);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async (showAlert = true) => {
    try {
      setIsLoading(true);
      const result = await requestLocationPermission(showAlert);
      setHasPermission(result.granted);
      return result;
    } catch (error) {
      console.error("Error requesting location permission:", error);
      return { granted: false, canAskAgain: false };
    } finally {
      setIsLoading(false);
    }
  };

  const getLocation = async () => {
    try {
      setIsLoading(true);
      const location = await getCurrentLocation();
      return location;
    } catch (error) {
      console.error("Error getting location:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    hasPermission,
    isLoading,
    requestPermission,
    getLocation,
    refreshPermission: checkPermission,
  };
};

