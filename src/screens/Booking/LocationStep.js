/**
 * Location Step Component
 * Select beach location for booking
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Search, Navigation, MapPin, AlertCircle } from "lucide-react-native";
import { colors, spacing, fontSizes, borderRadius, shadows } from "../../theme";
import { withOpacity } from "../../utils/colorHelper";
import {
  selectBookingData,
  setBeachId,
  setLocation,
  nextStep,
} from "../../redux/bookingFlowSlice";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Skeleton from "../../components/Skeleton";
import Map from "../../components/Map";
import { isPointInPolygon } from "../../utils/geo";
import { GOOGLE_MAPS_API_KEY } from "../../utils/constants";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const LocationStep = ({ beaches, isLoading }) => {
  const dispatch = useDispatch();
  const bookingData = useSelector(selectBookingData);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationError, setLocationError] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isInPolygon, setIsInPolygon] = useState(false);
  const [hasUserSelectedLocation, setHasUserSelectedLocation] = useState(false); // Track if user manually selected location

  const activeBeaches = beaches.filter((b) => b.isActive);

  const filteredBeaches = useMemo(() => {
    if (!searchQuery.trim()) return activeBeaches;
    const query = searchQuery.toLowerCase();
    return activeBeaches.filter(
      (beach) =>
        beach.name?.toLowerCase().includes(query) ||
        beach.city?.toLowerCase().includes(query) ||
        beach.country?.toLowerCase().includes(query)
    );
  }, [activeBeaches, searchQuery]);

  const handleGetCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      setLocationError(null);

      // Check if a beach is selected first
      if (!bookingData.beachId) {
        Alert.alert(
          "No Beach Selected",
          "Please select a beach first before getting your current location.",
          [{ text: "OK" }]
        );
        setIsGettingLocation(false);
        return;
      }

      // Get selected beach
      const selectedBeach = beaches.find((b) => b.id === bookingData.beachId);
      if (!selectedBeach) {
        Alert.alert(
          "Beach Not Found",
          "Selected beach not found. Please select a beach again.",
          [{ text: "OK" }]
        );
        setIsGettingLocation(false);
        return;
      }

      // Import location permission utility
      const { getCurrentLocation } = await import(
        "../../utils/locationPermission"
      );

      // Get user's current location
      const location = await getCurrentLocation();

      if (!location) {
        Alert.alert(
          "Location Unavailable",
          "Unable to get your location. Please enable location permissions in settings.",
          [{ text: "OK" }]
        );
        setIsGettingLocation(false);
        return;
      }

      // Check if location is within the selected beach's polygon
      let isInPolygon = false;
      if (
        selectedBeach.polygonBoundary &&
        Array.isArray(selectedBeach.polygonBoundary)
      ) {
        isInPolygon = isPointInPolygon(
          location.latitude,
          location.longitude,
          selectedBeach.polygonBoundary
        );
      } else {
        // If beach has no polygon, allow any location
        isInPolygon = true;
      }

      if (isInPolygon) {
        // Location is within polygon - mark it on map (same as manual tap)
        handleMapLocationSelect(
          location.latitude,
          location.longitude,
          true,
          selectedBeach.id
        );
      } else {
        // Location is outside polygon - show popup
        Alert.alert(
          "Outside Service Area",
          "You are outside the beach's service area. Please move to a location within the green polygon area or select a different beach.",
          [{ text: "OK" }]
        );
        setLocationError(
          "Your current location is outside the beach's service area."
        );
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to get your location. Please try again.",
        [{ text: "OK" }]
      );
      setLocationError(error.message || "Failed to get location");
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleBeachSelect = (beach) => {
    dispatch(setBeachId(beach.id));
    // Don't set initial location - user must select a location manually
    dispatch(setLocation({ latitude: 0, longitude: 0 }));
    setSelectedPlace(beach);
    setSearchQuery(beach.name);
    setLocationError(null);
    setHasUserSelectedLocation(false); // Reset - user hasn't manually selected yet
    setIsInPolygon(false); // No location selected yet
  };

  // Handle location selection from map
  const handleMapLocationSelect = (lat, lng, inPolygon, beachId) => {
    if (!inPolygon) {
      setLocationError(
        "Please select a location within the beach's service area (green polygon)."
      );
      setIsInPolygon(false);
      setHasUserSelectedLocation(false);
      return;
    }

    dispatch(setLocation({ latitude: lat, longitude: lng }));
    setIsInPolygon(true);
    setLocationError(null);
    setHasUserSelectedLocation(true); // User has manually selected a location
  };

  // Handle Undo button - reset beach selection and hide map
  const handleUndo = () => {
    dispatch(setBeachId(null));
    dispatch(setLocation({ latitude: 0, longitude: 0 }));
    setSelectedPlace(null);
    setSearchQuery("");
    setLocationError(null);
    setIsInPolygon(false);
    setHasUserSelectedLocation(false);
  };

  // Get selected beach data
  const selectedBeach =
    beaches.find((b) => b.id === bookingData.beachId) || null;

  // Validate that location is within polygon if beach has polygon
  // Only validate if user has manually selected a location
  useEffect(() => {
    if (
      selectedBeach &&
      bookingData.latitude !== 0 &&
      bookingData.longitude !== 0 &&
      hasUserSelectedLocation
    ) {
      if (
        selectedBeach.polygonBoundary &&
        Array.isArray(selectedBeach.polygonBoundary)
      ) {
        const inPolygon = isPointInPolygon(
          bookingData.latitude,
          bookingData.longitude,
          selectedBeach.polygonBoundary
        );
        setIsInPolygon(inPolygon);
        if (!inPolygon) {
          setLocationError(
            "Selected location is outside the beach's service area. Please select a point within the green polygon."
          );
        }
      } else {
        // Beach has no polygon, allow any location
        setIsInPolygon(true);
      }
    } else {
      setIsInPolygon(false);
    }
  }, [
    selectedBeach,
    bookingData.latitude,
    bookingData.longitude,
    hasUserSelectedLocation,
  ]);

  // Continue button is enabled only when:
  // 1. Beach is selected
  // 2. Location is set
  // 3. Location is within polygon
  // 4. User has manually selected a location (not just the initial pin)
  const canProceed =
    bookingData.beachId &&
    bookingData.latitude !== 0 &&
    bookingData.longitude !== 0 &&
    isInPolygon &&
    hasUserSelectedLocation;

  if (isLoading) {
    return <LocationStepSkeleton />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Your Beach</Text>
          <Text style={styles.subtitle}>
            Choose a beach on the map and mark your delivery spot
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <Input
            placeholder="Search beaches..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            icon={Search}
            containerStyle={styles.searchInput}
            editable={!selectedBeach}
          />
          <TouchableOpacity
            onPress={handleGetCurrentLocation}
            disabled={isGettingLocation || !bookingData.beachId}
            style={[
              styles.locationButton,
              (isGettingLocation || !bookingData.beachId) &&
                styles.locationButtonDisabled,
            ]}
          >
            <Navigation
              size={20}
              color={
                isGettingLocation || !bookingData.beachId
                  ? colors.textLight
                  : colors.primary
              }
              style={isGettingLocation && { transform: [{ rotate: "360deg" }] }}
            />
          </TouchableOpacity>
        </View>

        {locationError && (
          <View style={styles.errorContainer}>
            <AlertCircle size={16} color={colors.error} />
            <Text style={styles.errorText}>{locationError}</Text>
          </View>
        )}

        {/* Map Section - Show when beach is selected */}
        {selectedBeach && GOOGLE_MAPS_API_KEY && (
          <View style={styles.mapContainer}>
            <Map
              beaches={beaches}
              selectedBeach={selectedBeach}
              userLocation={
                bookingData.latitude !== 0 && bookingData.longitude !== 0
                  ? {
                      latitude: bookingData.latitude,
                      longitude: bookingData.longitude,
                    }
                  : null
              }
              onLocationSelect={handleMapLocationSelect}
            />
            {selectedBeach.polygonBoundary && (
              <View style={styles.mapHint}>
                <Text style={styles.mapHintText}>
                  📍 Tap on the map within the green area to select your
                  delivery location
                </Text>
              </View>
            )}
          </View>
        )}

        <ScrollView
          style={styles.beachList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.beachListContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {filteredBeaches.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No beaches found matching "{searchQuery}"
              </Text>
            </View>
          ) : (
            filteredBeaches.map((beach) => {
              const isSelected = beach.id === bookingData.beachId;
              return (
                <TouchableOpacity
                  key={beach.id}
                  onPress={() => handleBeachSelect(beach)}
                  activeOpacity={0.7}
                >
                  <Card
                    style={[
                      styles.beachCard,
                      isSelected && styles.beachCardSelected,
                    ]}
                  >
                    <View style={styles.beachCardContent}>
                      <View style={styles.beachCardLeft}>
                        <View
                          style={[
                            styles.beachIcon,
                            isSelected && styles.beachIconSelected,
                          ]}
                        >
                          <MapPin
                            size={20}
                            color={
                              isSelected ? colors.textWhite : colors.primary
                            }
                          />
                        </View>
                        <View style={styles.beachInfo}>
                          <Text
                            style={[
                              styles.beachName,
                              isSelected && styles.beachNameSelected,
                            ]}
                          >
                            {beach.name}
                          </Text>
                          <Text style={styles.beachLocation}>
                            {beach.city}, {beach.country}
                          </Text>
                        </View>
                      </View>
                      {isSelected && (
                        <View style={styles.selectedBadge}>
                          <Text style={styles.selectedBadgeText}>Selected</Text>
                        </View>
                      )}
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>

      <View style={styles.buttonContainer}>
        {bookingData.beachId && (
          <Button
            title="Reset"
            onPress={handleUndo}
            style={styles.cancelButton}
            textStyle={styles.cancelText}
          />
        )}
        <Button
          title="Continue"
          onPress={() => dispatch(nextStep())}
          disabled={!canProceed}
          style={[
            styles.continueButton,
            { width: selectedBeach ? "70%" : "100%" },
          ]}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

function LocationStepSkeleton() {
  return (
    <View style={styles.container}>
      <Skeleton width="100%" height={60} style={styles.skeleton} />
      <Skeleton width="100%" height={50} style={styles.skeleton} />
      <Skeleton width="100%" height={100} style={styles.skeleton} />
      <Skeleton width="100%" height={100} style={styles.skeleton} />
      <Skeleton width="100%" height={100} style={styles.skeleton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  contentWrapper: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSizes["2xl"],
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  searchContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
  },
  locationButton: {
    width: 50,
    height: 48,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    bottom: 2,
  },
  locationButtonDisabled: {
    opacity: 0.5,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.error + "10",
    borderRadius: borderRadius.medium,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: fontSizes.sm,
    color: colors.error,
  },
  mapContainer: {
    height: 300,
    width: "100%",
    marginBottom: spacing.md,
    borderRadius: borderRadius.medium,
    overflow: "hidden",
    backgroundColor: colors.background,
    ...shadows.small,
  },
  mapHint: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background + "E6",
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  mapHintText: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textAlign: "center",
  },
  beachList: {
    flex: 1,
  },
  beachListContent: {
    paddingBottom: spacing.md,
    flexGrow: 1,
  },
  beachCard: {
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: "transparent",
    ...shadows.md,
  },
  beachCardSelected: {
    borderColor: colors.primary,
    backgroundColor: withOpacity(colors.primary, 0.05),
    ...shadows.lg,
  },
  beachCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  beachCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
  },
  beachIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: withOpacity(colors.primary, 0.1),
    alignItems: "center",
    justifyContent: "center",
  },
  beachIconSelected: {
    backgroundColor: colors.primary,
  },
  beachInfo: {
    flex: 1,
  },
  beachName: {
    fontSize: fontSizes["2xl"],
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  beachNameSelected: {
    color: colors.primary,
  },
  beachLocation: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  selectedBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  selectedBadgeText: {
    fontSize: fontSizes.xs,
    fontWeight: "600",
    color: colors.textWhite,
  },
  buttonContainer: {
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,

    ...shadows.lg,
  },
  continueButton: {
    width: "68%",
    height: 50,
  },
  cancelButton: {
    width: "27%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 0,
    height: 50,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  skeleton: {
    marginBottom: spacing.md,
  },
  cancelText: {
    color: colors.primary,
  },
});

export default LocationStep;
