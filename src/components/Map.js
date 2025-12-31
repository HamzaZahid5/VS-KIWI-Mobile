/**
 * Map Component for React Native
 * Displays Google Maps with polygon boundaries and pin selection
 */

import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Dimensions, Alert } from "react-native";
import MapView, { Polygon, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Platform } from "react-native";
import { isPointInPolygon } from "../utils/geo";
import { colors } from "../theme";
// import { GOOGLE_MAPS_API_KEY } from "../utils/constants";

const { width, height } = Dimensions.get("window");
const GOOGLE_MAPS_API_KEY = "AIzaSyBohwGynBZ06VnR1zWDoaxzVOy3_6Y4aiQ";
const Map = ({
  beaches = [],
  selectedBeach = null,
  userLocation = null,
  onLocationSelect = null,
  initialRegion = null,
}) => {
  const mapRef = useRef(null);
  const [selectedPin, setSelectedPin] = useState(userLocation);

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

  // Fit map to show polygon when beach is selected
  useEffect(() => {
    if (selectedBeach && selectedPolygon && mapRef.current) {
      const coordinates = getPolygonCoordinates(selectedPolygon);
      if (coordinates.length > 0) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50,
          },
          animated: true,
        });
      }
    }
  }, [selectedBeach, selectedPolygon]);

  const polygonCoordinates = selectedPolygon
    ? getPolygonCoordinates(selectedPolygon)
    : [];

  // Use Google provider on Android if API key is available, default on iOS
  const mapProvider =
    Platform.OS === "android" && GOOGLE_MAPS_API_KEY
      ? PROVIDER_GOOGLE
      : undefined; // iOS uses Apple Maps by default, or Google if configured

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
        {selectedBeach && (
          <Marker
            coordinate={{
              latitude: parseFloat(selectedBeach.latitude) || 0,
              longitude: parseFloat(selectedBeach.longitude) || 0,
            }}
            title={selectedBeach.name}
            pinColor={colors.primary}
          />
        )}

        {/* Show user selected pin */}
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
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});

export default Map;
