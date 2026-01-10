/**
 * Extend Booking Screen
 * Allows users to extend the duration of an existing active booking
 */

import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { ChevronLeft, Check, MapPin } from "lucide-react-native";
import { colors, spacing, fontSizes, borderRadius } from "../../theme";
import {
  selectStep,
  selectBookingData,
  prevStep,
  goToStep,
  setStep,
  initializeFromOrder,
} from "../../redux/bookingFlowSlice";
import { get, post } from "../../utils/api";
import { beachesEndpoints, ordersEndpoints } from "../../utils/constants";
import DetailsStep from "./DetailsStep";
import ConfirmStep from "./ConfirmStep";
import Skeleton from "../../components/Skeleton";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const ExtendBookingScreen = ({ navigation, route }) => {
  const { orderId } = route.params || {};
  const dispatch = useDispatch();
  const step = useSelector(selectStep);
  const bookingData = useSelector(selectBookingData);

  // Fetch order data
  const [order, setOrder] = React.useState(null);
  const [orderLoading, setOrderLoading] = React.useState(true);
  const [selectedBeachData, setSelectedBeachData] = React.useState(null);
  const [isBeachLoading, setIsBeachLoading] = React.useState(false);
  const [extendLoading, setExtendLoading] = React.useState(false);

  // Load existing order
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        Alert.alert("Error", "Order ID is missing.");
        navigation.goBack();
        return;
      }

      try {
        setOrderLoading(true);
        const response = await get(ordersEndpoints.getById(orderId));
        const orderData = response?.data;
        setOrder(orderData);

        // Initialize booking store from order
        if (orderData) {
          dispatch(initializeFromOrder(orderData));
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        Alert.alert("Error", "Failed to load booking. Please try again.");
        navigation.goBack();
      } finally {
        setOrderLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, dispatch, navigation]);

  // Fetch beach details
  useEffect(() => {
    const fetchBeachDetails = async () => {
      if (!bookingData.beachId || !order) {
        setSelectedBeachData(null);
        return;
      }

      try {
        setIsBeachLoading(true);
        const response = await get(
          beachesEndpoints.getById(bookingData.beachId)
        );
        setSelectedBeachData(response?.data || null);
      } catch (error) {
        console.error("Error fetching beach details:", error);
      } finally {
        setIsBeachLoading(false);
      }
    };

    fetchBeachDetails();
  }, [bookingData.beachId, order]);

  // Skip payment step in extend mode - go directly to confirm
  useEffect(() => {
    if (step === "payment") {
      dispatch(setStep("confirm"));
    }
  }, [step, dispatch]);

  // Calculate extension price based on existing order items
  const extensionPrice = useMemo(() => {
    if (!order?.items || !selectedBeachData?.inventory || !bookingData.durationHours) {
      return 0;
    }

    // Get pricing from inventory (each inventory item has pricing info)
    // For now, use a simple calculation based on order items
    // The backend will calculate the exact price
    let total = 0;
    const HOURLY_RATE = 10; // Base hourly rate
    const SIZE_MULTIPLIERS = {
      small: 0.7,
      medium: 1,
      large: 1.4,
    };

    order.items.forEach((item) => {
      const multiplier = SIZE_MULTIPLIERS[item.size] || 1;
      const itemPrice =
        HOURLY_RATE * multiplier * bookingData.durationHours * item.quantity;
      total += itemPrice;
    });

    return total;
  }, [order?.items, selectedBeachData, bookingData.durationHours]);

  const handleBack = () => {
    if (step === "details") {
      // Navigate back to booking details
      const parent = navigation.getParent();
      if (parent) {
        parent.navigate("BookingDetails", { orderId });
      } else {
        navigation.goBack();
      }
    } else if (step === "confirm") {
      // Go back to details step
      dispatch(goToStep("details"));
    } else {
      dispatch(prevStep());
    }
  };

  const handleStepClick = (targetStep) => {
    dispatch(goToStep(targetStep));
  };

  const handleConfirm = async () => {
    if (!bookingData.termsAccepted) {
      Alert.alert("Terms Required", "Please accept the terms and conditions.");
      return;
    }

    if (!orderId) {
      Alert.alert("Error", "Order ID is missing.");
      return;
    }

    if (!bookingData.durationHours || bookingData.durationHours <= 0) {
      Alert.alert(
        "Duration Required",
        "Please select the number of hours to extend."
      );
      return;
    }

    try {
      setExtendLoading(true);
      const response = await post(ordersEndpoints.extend(orderId), {
        additionalHours: bookingData.durationHours,
      });

      // API response structure: { data: { id: string; clientSecret?: string } }
      const result = response?.data;
      const clientSecret = result?.data?.clientSecret || result?.clientSecret;

      console.log("Extend booking response:", response);
      console.log("Client secret:", clientSecret);

      // If clientSecret is provided, redirect to payment page
      if (clientSecret && orderId) {
        const parent = navigation.getParent();
        if (parent) {
          parent.navigate("Payment", {
            orderId: orderId, // Use original order ID, not extension ID
            clientSecret: clientSecret,
            isExtension: true,
            extensionAmount: extensionPrice,
          });
        } else {
          navigation.navigate("Payment", {
            orderId: orderId,
            clientSecret: clientSecret,
            isExtension: true,
            extensionAmount: extensionPrice,
          });
        }
      } else {
        // If no payment required, redirect to booking details
        Alert.alert(
          "Booking Extended",
          `Your booking has been extended by ${bookingData.durationHours} hour${bookingData.durationHours > 1 ? "s" : ""}.`,
          [
            {
              text: "OK",
              onPress: () => {
                const parent = navigation.getParent();
                if (parent) {
                  parent.navigate("BookingDetails", { orderId });
                } else {
                  navigation.goBack();
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error extending booking:", error);
      Alert.alert(
        "Extension Failed",
        error?.message || "Failed to extend booking. Please try again."
      );
    } finally {
      setExtendLoading(false);
    }
  };

  // Steps for extend flow: details, confirm (skip payment as backend handles it)
  const extendSteps = ["details", "confirm"];
  const extendStepIndex = extendSteps.indexOf(step) + 1;

  if (orderLoading || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.skeletonContainer}>
          <Skeleton style={styles.skeleton} />
          <Skeleton style={styles.skeleton} />
          <Skeleton style={styles.skeleton} />
        </View>
      </SafeAreaView>
    );
  }

  const selectedBeach = selectedBeachData?.data || selectedBeachData;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={colors.text} />
          <Text style={styles.backButtonText}>Previous</Text>
        </TouchableOpacity>

        {/* Step Indicators */}
        <View style={styles.stepsContainer}>
          {extendSteps.map((s, i) => {
            const stepName = s === "details" ? "Select" : "Confirm";
            const isCompleted = extendStepIndex > i + 1;
            const isCurrent = extendStepIndex === i + 1;
            const isClickable = extendStepIndex >= i + 1;

            return (
              <View key={s} style={styles.stepWrapper}>
                <TouchableOpacity
                  onPress={() => handleStepClick(s)}
                  disabled={!isClickable}
                  style={[
                    styles.stepIndicator,
                    isCompleted && styles.stepIndicatorCompleted,
                    isCurrent && styles.stepIndicatorCurrent,
                    !isClickable && styles.stepIndicatorDisabled,
                  ]}
                  activeOpacity={0.7}
                >
                  {isCompleted ? (
                    <Check size={16} color={colors.primaryForeground} />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumber,
                        isCurrent && styles.stepNumberCurrent,
                      ]}
                    >
                      {i + 1}
                    </Text>
                  )}
                </TouchableOpacity>
                {i < extendSteps.length - 1 && (
                  <View
                    style={[
                      styles.stepConnector,
                      extendStepIndex > i + 1 && styles.stepConnectorCompleted,
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />
      </View>

      {/* Selected Beach Banner */}
      {selectedBeach && (
        <View style={styles.beachBanner}>
          <View style={styles.beachBannerIcon}>
            <MapPin size={20} color={colors.primary} />
          </View>
          <View style={styles.beachBannerContent}>
            <Text style={styles.beachBannerName} numberOfLines={1}>
              {selectedBeach.name}
            </Text>
            <Text style={styles.beachBannerLocation} numberOfLines={1}>
              {selectedBeach.city}, {selectedBeach.country}
            </Text>
          </View>
        </View>
      )}

      {/* Step Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {step === "details" && (
          <DetailsStep
            beachData={selectedBeachData}
            isLoading={isBeachLoading}
            isExtendMode={true}
            originalOrderId={orderId}
            orderItems={order?.items}
          />
        )}

        {step === "confirm" && (
          <ConfirmStep
            selectedBeach={selectedBeach}
            basePrice={extensionPrice}
            discount={0}
            totalPrice={extensionPrice}
            onConfirm={handleConfirm}
            isLoading={extendLoading}
            isExtendMode={true}
            orderItems={order?.items}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skeletonContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  skeleton: {
    height: 200,
    borderRadius: borderRadius.medium,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  backButtonText: {
    fontSize: fontSizes.base,
    fontWeight: "600",
    color: colors.text,
  },
  stepsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  stepWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  stepIndicatorCompleted: {
    backgroundColor: colors.primary,
  },
  stepIndicatorCurrent: {
    backgroundColor: colors.primary,
  },
  stepIndicatorDisabled: {
    opacity: 0.5,
  },
  stepNumber: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.textMuted,
  },
  stepNumberCurrent: {
    color: colors.primaryForeground,
  },
  stepConnector: {
    width: 32,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  stepConnectorCompleted: {
    backgroundColor: colors.primary,
  },
  spacer: {
    width: 80,
  },
  beachBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.primary + "0D",
    borderWidth: 1,
    borderColor: colors.primary + "33",
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  beachBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + "1A",
    alignItems: "center",
    justifyContent: "center",
  },
  beachBannerContent: {
    flex: 1,
    minWidth: 0,
  },
  beachBannerName: {
    fontSize: fontSizes.base,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  beachBannerLocation: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
});

export default ExtendBookingScreen;

