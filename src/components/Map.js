/**
 * Map Component for React Native
 * Displays Google Maps with polygon boundaries and pin selection
 */

import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Dimensions, Alert, Platform } from "react-native";
import MapView, { Polygon, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { isPointInPolygon } from "../utils/geo";
import { colors } from "../theme";
import { GOOGLE_MAPS_API_KEY } from "../utils/constants";

const { width, height } = Dimensions.get("window");
const Map = ({
  beaches = [],
  selectedBeach = null,
  userLocation = null,
  onLocationSelect = null,
  initialRegion = null,
}) => {
  const mapRef = useRef(null);
  const [selectedPin, setSelectedPin] = useState(userLocation);
  const [mapReady, setMapReady] = useState(false);

  // Get polygon for selected beach
  const selectedPolygon = selectedBeach?.polygonBoundary || null;

  // Calculate initial region
  const getInitialRegion = () => {
    if (initialRegion) {
      return initialRegion;
    }

    if (selectedBeach) {
      const lat = parseFloat(selectedBeach.latitude) || 25.2048;
      const lng = parseFloat(selectedBeach.longitude) || 55.2708;
      return {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    // Default to Dubai
    return {
      latitude: 25.2048,
      longitude: 55.2708,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  };

  // Convert polygon coordinates to map format
  const getPolygonCoordinates = (polygon) => {
    if (!polygon || !Array.isArray(polygon)) {
      return [];
    }

    return polygon.map((point) => {
      if (Array.isArray(point)) {
        // Format: [lng, lat]
        return {
          latitude: point[1],
          longitude: point[0],
        };
      }
      // Format: {lat, lng}
      return {
        latitude: point.lat || point.latitude,
        longitude: point.lng || point.longitude,
      };
    });
  };

  // Handle map press
  const handleMapPress = (event) => {
    if (!selectedBeach || !onLocationSelect) {
      return;
    }

    const { latitude, longitude } = event.nativeEvent.coordinate;
    console.log("==\n\n\n=========", latitude, longitude);

    // Check if point is within polygon
    const isInPolygon = selectedPolygon
      ? isPointInPolygon(latitude, longitude, selectedPolygon)
      : false;

    if (!isInPolygon) {
      Alert.alert(
        "Location Outside Service Area",
        "Please select a location within the beach's service area (green polygon).",
        [{ text: "OK" }]
      );
      return;
    }

    // Point is valid, update selection
    setSelectedPin({ latitude, longitude });
    onLocationSelect(latitude, longitude, true, selectedBeach.id);
  };

  // Update selected pin when userLocation changes
  useEffect(() => {
    if (userLocation) {
      setSelectedPin(userLocation);
    }
  }, [userLocation]);

  // Fit map to show polygon when beach is selected - with closer zoom
  useEffect(() => {
    if (selectedBeach && selectedPolygon && mapRef.current && mapReady) {
      const coordinates = getPolygonCoordinates(selectedPolygon);
      if (coordinates.length > 0) {
        // Use smaller edgePadding for closer zoom
        // Also add a small delay to ensure map is fully rendered
        const timer = setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.fitToCoordinates(coordinates, {
              edgePadding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
              },
              animated: true,
            });
          }
        }, 100);
        
        return () => clearTimeout(timer);
      }
    }
  }, [selectedBeach, selectedPolygon, mapReady]);

  const polygonCoordinates = selectedPolygon
    ? getPolygonCoordinates(selectedPolygon)
    : [];

  // Use Google provider on Android - API key is configured in AndroidManifest.xml
  // On iOS, it uses Apple Maps by default unless Google Maps SDK is configured
  // Always use PROVIDER_GOOGLE on Android for Google Maps
  const mapProvider = Platform.OS === "android" ? PROVIDER_GOOGLE : undefined;
  
  // Debug: Log provider info on mount
  useEffect(() => {
    if (Platform.OS === "android") {
      console.log("🗺️ Android Map Configuration:");
      console.log("  - Provider:", mapProvider === PROVIDER_GOOGLE ? "PROVIDER_GOOGLE" : "undefined");
      console.log("  - API Key in manifest: AIzaSyAMUZ3olCqUk0-s1ldkorU4e5jRzndX4Q0");
      console.log("  - Selected Beach:", selectedBeach?.name || "None");
    }
  }, [selectedBeach]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={mapProvider}
        style={styles.map}
        initialRegion={getInitialRegion()}
        onPress={handleMapPress}
        showsUserLocation={false}
        showsMyLocationButton={false}
        mapType="standard"
        loadingEnabled={true}
        loadingIndicatorColor={colors.primary}
        loadingBackgroundColor={colors.background}
        onMapReady={() => {
          console.log("✅ Map is ready on", Platform.OS);
          if (Platform.OS === "android") {
            console.log("✅ Android Map initialized successfully");
          }
          setMapReady(true);
        }}
        onError={(error) => {
          console.error("❌ Map error:", error);
          if (Platform.OS === "android") {
            console.error("Android Map Error Details:", JSON.stringify(error, null, 2));
            console.error("Check AndroidManifest.xml for com.google.android.geo.API_KEY");
            console.error("Current API Key in manifest: AIzaSyAMUZ3olCqUk0-s1ldkorU4e5jRzndX4Q0");
            console.error("Provider:", mapProvider === PROVIDER_GOOGLE ? "PROVIDER_GOOGLE" : "undefined");
            console.error("Make sure:");
            console.error("  1. API key has Android app restrictions enabled");
            console.error("  2. Package name matches: com.kiwi.app");
            console.error("  3. SHA-1 fingerprint is added to Google Cloud Console");
          }
        }}
        onLoad={() => {
          console.log("✅ Map loaded successfully on", Platform.OS);
        }}
      >
        {/* Show polygon for selected beach */}
        {selectedBeach && polygonCoordinates.length > 0 && (
          <Polygon
            coordinates={polygonCoordinates}
            strokeColor="#4CAF50" // Light green
            fillColor="#4CAF5033" // Light green with transparency
            strokeWidth={2}
          />
        )}

        {/* Show marker for selected beach center */}
        {/* {selectedBeach && (
          <Marker
            coordinate={{
              latitude: parseFloat(selectedBeach.latitude) || 0,
              longitude: parseFloat(selectedBeach.longitude) || 0,
            }}
            title={selectedBeach.name}
            pinColor={colors.primary}
          />
        )} */}

        {/* Show user selected pin - only appears after user selects a location */}
        {selectedPin && (
          <Marker
            coordinate={selectedPin}
            title="Delivery Location"
            pinColor="#FF6B6B"
            draggable={true}
            onDragEnd={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              const isInPolygon = selectedPolygon
                ? isPointInPolygon(latitude, longitude, selectedPolygon)
                : false;

              if (!isInPolygon) {
                Alert.alert(
                  "Location Outside Service Area",
                  "Please drag the pin to a location within the beach's service area (green polygon).",
                  [{ text: "OK" }]
                );
                return;
              }

              setSelectedPin({ latitude, longitude });
              if (onLocationSelect) {
                onLocationSelect(latitude, longitude, true, selectedBeach?.id);
              }
            }}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});

export default Map;
