/**
 * Booking Screen
 * Main booking flow screen with multi-step process
 */

import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { ChevronLeft, Check, MapPin } from "lucide-react-native";
import { colors, spacing, fontSizes, borderRadius } from "../../theme";
import {
  selectStep,
  selectBookingData,
  selectStepIndex,
  prevStep,
  goToStep,
  reset,
  selectBasePrice,
  selectTotalPrice,
  selectOrderPayload,
} from "../../redux/bookingFlowSlice";
import { get, post } from "../../utils/api";
import { beachesEndpoints, ordersEndpoints } from "../../utils/constants";
import LocationStep from "./LocationStep";
import BookingTypeStep from "./BookingTypeStep";
import DetailsStep from "./DetailsStep";
import PaymentStep from "./PaymentStep";
import ConfirmStep from "./ConfirmStep";
import Skeleton from "../../components/Skeleton";
import Button from "../../components/Button";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const STEPS = ["location", "type", "details", "payment", "confirm"];

const BookingScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const step = useSelector(selectStep);
  const bookingData = useSelector(selectBookingData);
  const stepIndex = useSelector(selectStepIndex);
  const basePrice = useSelector(selectBasePrice);
  const totalPrice = useSelector(selectTotalPrice);

  const preSelectedBeach = route?.params?.beach;
  const preSelectedType = route?.params?.type;

  // Reset booking flow when screen comes into focus (ensures fresh start each time)
  useFocusEffect(
    React.useCallback(() => {
      dispatch(reset({ preSelectedBeach, preSelectedType }));
    }, [dispatch, preSelectedBeach, preSelectedType])
  );

  // Fetch beaches data
  const [beaches, setBeaches] = React.useState([]);
  const [beachesLoading, setBeachesLoading] = React.useState(true);
  const [selectedBeachData, setSelectedBeachData] = React.useState(null);
  const [isBeachLoading, setIsBeachLoading] = React.useState(false);

  useEffect(() => {
    const fetchBeaches = async () => {
      try {
        setBeachesLoading(true);
        const response = await get(beachesEndpoints.list);
        setBeaches(response?.data || []);
      } catch (error) {
        console.error("Error fetching beaches:", error);
      } finally {
        setBeachesLoading(false);
      }
    };

    fetchBeaches();
  }, []);

  // Fetch selected beach details
  useEffect(() => {
    const fetchBeachDetails = async () => {
      if (!bookingData.beachId) {
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
  }, [bookingData.beachId]);

  const selectedBeach = beaches?.find((b) => b.id === bookingData.beachId);

  const handleBack = () => {
    if (step === "location") {
      navigation.goBack();
    } else {
      dispatch(prevStep());
    }
  };

  const handleStepClick = (targetStep) => {
    dispatch(goToStep(targetStep));
  };

  // if (beachesLoading) {
  //   return <LoadingSkeleton />;
  // }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button and Step Indicators */}
        <TouchableOpacity
          onPress={handleBack}
          style={{
            backgroundColor: "#fff",
            width: 40,
            height: 40,
            justifyContent: "center",
            borderWidth: 1,
            borderRadius: 20,
            borderColor: colors.primary,
            alignItems: "center",
          }}
        >
          <ChevronLeft size={26} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.headerTop}>
            {/* Step Indicators */}
            <View style={styles.stepIndicators}>
              {STEPS.map((s, i) => {
                const isCompleted = stepIndex > i + 1;
                const isCurrent = stepIndex === i + 1;
                const isClickable = stepIndex >= i + 1;

                return (
                  <View key={s} style={styles.stepIndicatorContainer}>
                    <TouchableOpacity
                      onPress={() => isClickable && handleStepClick(s)}
                      disabled={!isClickable}
                      style={[
                        styles.stepIndicator,
                        isCompleted && styles.stepIndicatorCompleted,
                        isCurrent && styles.stepIndicatorCurrent,
                        !isClickable && styles.stepIndicatorDisabled,
                      ]}
                    >
                      {isCompleted ? (
                        <Check size={14} color={colors.textWhite} />
                      ) : (
                        <Text
                          style={[
                            styles.stepIndicatorText,
                            isCurrent && styles.stepIndicatorTextCurrent,
                          ]}
                        >
                          {i + 1}
                        </Text>
                      )}
                    </TouchableOpacity>
                    {i < STEPS.length - 1 && (
                      <View
                        style={[
                          styles.stepConnector,
                          isCompleted && styles.stepConnectorCompleted,
                        ]}
                      />
                    )}
                  </View>
                );
              })}
            </View>

            {/* Spacer for tablet */}
            {isTablet && <View style={styles.spacer} />}
          </View>

          {/* Selected Beach Banner */}
          {step !== "location" && selectedBeach && (
            <View style={styles.beachBanner}>
              <View style={styles.beachBannerIcon}>
                <MapPin size={20} color={colors.primary} />
              </View>
              <View style={styles.beachBannerContent}>
                <Text style={styles.beachBannerName}>{selectedBeach.name}</Text>
                <Text style={styles.beachBannerLocation}>
                  {selectedBeach.city}, {selectedBeach.country}
                </Text>
              </View>
              <Button
                title="Change"
                onPress={() => dispatch(goToStep("location"))}
                variant="ghost"
                style={styles.changeButton}
              />
            </View>
          )}
        </View>

        {/* Step Content */}
        <View style={styles.content}>
          {step === "location" && (
            <LocationStep beaches={beaches} isLoading={beachesLoading} />
          )}

          {step === "type" && (
            <BookingTypeStep
              serviceStartTime={selectedBeachData?.serviceStartTime}
              serviceEndTime={selectedBeachData?.serviceEndTime}
              isLoading={isBeachLoading}
            />
          )}

          {step === "details" && (
            <DetailsStep
              beachData={selectedBeachData}
              isLoading={isBeachLoading}
            />
          )}

          {step === "payment" && <PaymentStep />}

          {step === "confirm" && (
            <ConfirmStep
              selectedBeach={selectedBeach}
              basePrice={basePrice}
              discount={0}
              totalPrice={totalPrice}
              onConfirm={async () => {
                try {
                  // Use selector to get order payload (matches web app)
                  const payload = selectOrderPayload({
                    bookingFlow: { bookingData },
                  });

                  const response = await post(ordersEndpoints.create, payload);

                  if (response?.data?.id) {
                    // Navigate to Payment screen for Stripe payments
                    if (
                      bookingData.paymentMethod === "stripe" &&
                      response?.data?.clientSecret
                    ) {
                      navigation.navigate("Payment", {
                        orderId: response.data.id,
                        clientSecret: response.data.clientSecret,
                      });
                    } else {
                      // For COD or if no clientSecret, navigate to Home
                      Alert.alert(
                        "Booking Confirmed!",
                        `Your booking has been created successfully. Order ID: ${response.data.id}`,
                        [
                          {
                            text: "OK",
                            onPress: () => navigation.navigate("Home"),
                          },
                        ]
                      );
                    }
                  }
                } catch (error) {
                  console.error("Error creating order:", error);
                  Alert.alert(
                    "Booking Failed",
                    error.message || "Failed to create booking"
                  );
                }
              }}
              isLoading={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

function LoadingSkeleton() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.skeletonContainer}>
        <Skeleton width="100%" height={40} style={styles.skeleton} />
        <Skeleton width="100%" height={200} style={styles.skeleton} />
        <Skeleton width="100%" height={100} style={styles.skeleton} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTop: {
    // alignItems: "center",
    marginBottom: spacing.md,
  },
  backButton: {
    minWidth: 100,
  },
  stepIndicators: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    marginHorizontal: spacing.md,
  },
  stepIndicatorContainer: {
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
  stepIndicatorText: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.textMuted,
  },
  stepIndicatorTextCurrent: {
    color: colors.textWhite,
  },
  stepConnector: {
    width: isTablet ? 32 : 16,
    height: 2,
    backgroundColor: colors.muted,
    marginHorizontal: 4,
  },
  stepConnectorCompleted: {
    backgroundColor: colors.primary,
  },
  spacer: {
    width: 100,
  },
  beachBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary + "10",
    borderWidth: 1,
    borderColor: colors.primary + "30",
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    gap: spacing.md,
  },
  beachBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  beachBannerContent: {
    flex: 1,
  },
  beachBannerName: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.text,
  },
  beachBannerLocation: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  changeButton: {
    minWidth: 60,
  },
  content: {
    flex: 1,
  },
  skeletonContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  skeleton: {
    marginBottom: spacing.md,
  },
});

export default BookingScreen;
