/**
 * Location Step Component
 * Select beach location for booking
 */

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
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
// Location will be handled via a simple selection for now
// import * as Location from 'expo-location';

const LocationStep = ({ beaches, isLoading }) => {
  const dispatch = useDispatch();
  const bookingData = useSelector(selectBookingData);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationError, setLocationError] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

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

      // For now, just select the first active beach
      // In production, implement proper geolocation with expo-location
      const nearestBeach = activeBeaches[0];
      if (nearestBeach) {
        dispatch(setBeachId(nearestBeach.id));
        dispatch(
          setLocation({
            latitude: parseFloat(nearestBeach.latitude) || 0,
            longitude: parseFloat(nearestBeach.longitude) || 0,
          })
        );
      } else {
        setLocationError("No beaches available");
      }
    } catch (error) {
      setLocationError(error.message || "Failed to get location");
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleBeachSelect = (beach) => {
    dispatch(setBeachId(beach.id));
    dispatch(
      setLocation({
        latitude: parseFloat(beach.latitude) || 0,
        longitude: parseFloat(beach.longitude) || 0,
      })
    );
  };

  const canProceed =
    bookingData.beachId &&
    bookingData.latitude !== 0 &&
    bookingData.longitude !== 0;

  if (isLoading) {
    return <LocationStepSkeleton />;
  }

  return (
    <View style={styles.container}>
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
        />
        <TouchableOpacity
          onPress={handleGetCurrentLocation}
          disabled={isGettingLocation}
          style={[
            styles.locationButton,
            isGettingLocation && styles.locationButtonDisabled,
          ]}
        >
          <Navigation
            size={20}
            color={isGettingLocation ? colors.textMuted : colors.primary}
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

      <ScrollView style={styles.beachList} showsVerticalScrollIndicator={false}>
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
                          color={isSelected ? colors.textWhite : colors.primary}
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

      <Button
        title="Continue"
        onPress={() => dispatch(nextStep())}
        disabled={!canProceed}
        style={styles.continueButton}
      />
    </View>
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
    height: 50,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
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
  beachList: {
    flex: 1,
    marginBottom: spacing.md,
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
  continueButton: {
    marginTop: spacing.md,
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
});

export default LocationStep;
