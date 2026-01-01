/**
 * Location Permission Utility
 * Handles location permissions for Android and iOS
 */

import * as Location from "expo-location";
import { Platform, Alert } from "react-native";

/**
 * Check if location permission is granted
 * @returns {Promise<boolean>} True if permission is granted
 */
export const checkLocationPermission = async () => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error checking location permission:", error);
    return false;
  }
};

/**
 * Request location permission
 * @param {boolean} showAlert - Whether to show alert if permission is denied
 * @returns {Promise<{granted: boolean, canAskAgain: boolean}>}
 */
export const requestLocationPermission = async (showAlert = true) => {
  try {
    // Check current permission status
    const { status: existingStatus } =
      await Location.getForegroundPermissionsAsync();

    // If already granted, return success
    if (existingStatus === "granted") {
      return { granted: true, canAskAgain: true };
    }

    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status === "granted") {
      return { granted: true, canAskAgain: true };
    }

    // Permission denied
    if (showAlert) {
      const message =
        Platform.OS === "ios"
          ? "Location permission is required to find nearby beaches. Please enable it in Settings."
          : "Location permission is required to find nearby beaches. Please enable it in your device settings.";

      Alert.alert(
        "Location Permission Required",
        message,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Open Settings",
            onPress: () => {
              if (Platform.OS === "ios") {
                Location.enableNetworkProviderAsync();
              }
              // On Android, user needs to manually go to settings
            },
          },
        ],
        { cancelable: true }
      );
    }

    return { granted: false, canAskAgain: status !== "denied" };
  } catch (error) {
    console.error("Error requesting location permission:", error);
    return { granted: false, canAskAgain: false };
  }
};

/**
 * Initialize location permission on app startup
 * Checks if permission exists, requests if needed
 * @returns {Promise<boolean>} True if permission is available
 */
export const initializeLocationPermission = async () => {
  try {
    // Check if permission is already granted
    const hasPermission = await checkLocationPermission();

    if (hasPermission) {
      console.log("Location permission already granted");
      return true;
    }

    // Request permission (don't show alert on initial request)
    const result = await requestLocationPermission(false);

    if (result.granted) {
      console.log("Location permission granted");
      return true;
    }

    console.log("Location permission not granted");
    return false;
  } catch (error) {
    console.error("Error initializing location permission:", error);
    return false;
  }
};

/**
 * Get current location if permission is granted
 * @returns {Promise<{latitude: number, longitude: number} | null>}
 */
export const getCurrentLocation = async () => {
  try {
    const hasPermission = await checkLocationPermission();

    if (!hasPermission) {
      const result = await requestLocationPermission(true);
      if (!result.granted) {
        return null;
      }
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error("Error getting current location:", error);
    return null;
  }
};

