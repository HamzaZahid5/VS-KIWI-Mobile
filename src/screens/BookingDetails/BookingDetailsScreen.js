/**
 * Booking Details Screen
 * Shows detailed information about a booking, matching web app exactly
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Linking,
  Dimensions,
  RefreshControl,
} from "react-native";
import {
  MapPin,
  Timer,
  Clock,
  Calendar,
  CreditCard,
  Plus,
  Phone,
  MessageCircle,
  CheckCircle,
  Circle,
  AlertCircle,
  ChevronLeft,
} from "lucide-react-native";
import { format } from "date-fns";
import { colors, fontSizes, spacing, borderRadius, shadows } from "../../theme";
import { withOpacity } from "../../utils/colorHelper";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Progress from "../../components/Progress";
import Button from "../../components/Button";
import Skeleton from "../../components/Skeleton";
import { get } from "../../utils/api";
import { ordersEndpoints } from "../../utils/constants";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const BookingDetailsScreen = ({ navigation, route }) => {
  const { orderId, fromScreen } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  useEffect(() => {
    // Timer should start when order is delivered
    if (!order?.deliveredAt) {
      setTimeRemaining(0);
      setProgress(0);
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const deliveredAt = new Date(order.deliveredAt).getTime();

      // Use countdownEndsAt if available, otherwise calculate from deliveredAt + durationHours
      let endsAt;
      if (order.countdownEndsAt) {
        endsAt = new Date(order.countdownEndsAt).getTime();
      } else {
        // Calculate end time: deliveredAt + durationHours
        endsAt = deliveredAt + order.durationHours * 60 * 60 * 1000;
      }

      // Use countdownStartedAt if available, otherwise use deliveredAt
      const startedAt = order.countdownStartedAt
        ? new Date(order.countdownStartedAt).getTime()
        : deliveredAt;

      const remaining = Math.max(0, endsAt - now);
      const total = endsAt - startedAt;

      setTimeRemaining(remaining);
      // Progress should show time elapsed (0% to 100%), not time remaining
      const elapsed = total - remaining;
      setProgress(total > 0 ? (elapsed / total) * 100 : 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [
    order?.deliveredAt,
    order?.countdownEndsAt,
    order?.countdownStartedAt,
    order?.durationHours,
  ]);

  const fetchOrderDetails = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      const response = await get(ordersEndpoints.getById(orderId));
      console.log("========>>>>>>>", response?.data);

      setOrder(response?.data || null);
    } catch (error) {
      console.error("Error fetching order details:", error);
      if (!isRefresh) {
        Alert.alert("Error", "Failed to load booking details");
        navigation.goBack();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrderDetails(true);
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const getStatusStep = (status) => {
    const steps = ["new", "assigned", "delivered", "collected"];
    return steps.indexOf(status || "new");
  };

  const getStatusBadge = (status, paymentStatus) => {
    switch (status) {
      case "new":
        if (paymentStatus === "pending") {
          return <Badge variant="warning">Pending</Badge>;
        } else if (paymentStatus === "paid") {
          return <Badge variant="outline">Confirmed</Badge>;
        }
        return <Badge variant="secondary">Pending</Badge>;
      case "assigned":
        return (
          <View
            style={[
              styles.badgeCustom,
              { backgroundColor: withOpacity("#3B82F6", 0.1) },
            ]}
          >
            <Text style={[styles.badgeCustomText, { color: "#3B82F6" }]}>
              On the way
            </Text>
          </View>
        );
      case "delivered":
        return (
          <View
            style={[
              styles.badgeCustom,
              { backgroundColor: withOpacity(colors.primary, 0.1) },
            ]}
          >
            <Text style={[styles.badgeCustomText, { color: colors.primary }]}>
              Active
            </Text>
          </View>
        );
      case "collected":
        return <Badge variant="default">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleCallSupport = () => {
    Linking.openURL("tel:+1234567890"); // Replace with actual support number
  };

  const handleChatSupport = () => {
    // Implement chat support navigation or action
    Alert.alert("Chat Support", "Chat feature coming soon!");
  };

  const handleExtendRental = () => {
    navigation.navigate("ExtendBooking", { orderId: order.id });
  };

  const handlePayNow = () => {
    navigation.navigate("Payment", { orderId: order.id });
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={colors.mutedForeground} />
          <Text style={styles.errorTitle}>Booking not found</Text>
          <Button
            title={fromScreen === "BookingHistory" ? "Go back" : "Go back home"}
            onPress={() => {
              // If coming from BookingHistory, go back to it
              if (fromScreen === "BookingHistory") {
                navigation.goBack();
              } else {
                // Otherwise, navigate to Home
                const parent = navigation.getParent();
                if (parent) {
                  parent.navigate("MainTabs", { screen: "HomeTab" });
                } else {
                  navigation.navigate("MainTabs", { screen: "HomeTab" });
                }
              }
            }}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Calculate total quantity from items if available
  const totalQuantity =
    order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  const orderSizes = order.items
    ?.map((item) => `${item.quantity}x ${item.size}`)
    .join(", ");

  const isLowTime = timeRemaining > 0 && timeRemaining < 10 * 60 * 1000;
  const isVeryLowTime = timeRemaining > 0 && timeRemaining < 60 * 1000;
  const statusStep = getStatusStep(order.status);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              // If coming from a specific screen, go back to that screen
              if (fromScreen === "BookingHistory") {
                navigation.goBack();
              } else {
                // Otherwise, navigate to Home
                const parent = navigation.getParent();
                if (parent) {
                  parent.navigate("MainTabs", { screen: "HomeTab" });
                } else {
                  navigation.navigate("MainTabs", { screen: "HomeTab" });
                }
              }
            }}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Countdown Timer Card */}
        {order.deliveredAt && (
          <Card
            style={[
              styles.countdownCard,
              isVeryLowTime && styles.countdownCardDanger,
              isLowTime && !isVeryLowTime && styles.countdownCardWarning,
            ]}
          >
            <View style={styles.countdownContent}>
              <View
                style={[
                  styles.countdownHeader,
                  isVeryLowTime && styles.countdownHeaderDanger,
                  isLowTime && !isVeryLowTime && styles.countdownHeaderWarning,
                ]}
              >
                <Text style={styles.countdownLabel}>Time Remaining</Text>
                <Text
                  style={[
                    styles.countdownTime,
                    isVeryLowTime && styles.countdownTimeDanger,
                    isLowTime && !isVeryLowTime && styles.countdownTimeWarning,
                  ]}
                >
                  {formatTime(timeRemaining)}
                </Text>
                <Progress
                  value={progress}
                  style={styles.countdownProgress}
                  barStyle={
                    isVeryLowTime
                      ? { backgroundColor: colors.error }
                      : isLowTime
                      ? { backgroundColor: colors.warning }
                      : null
                  }
                />
                {isLowTime && (
                  <View style={styles.countdownAlert}>
                    <AlertCircle
                      size={16}
                      color={isVeryLowTime ? colors.error : colors.warning}
                    />
                    <Text
                      style={[
                        styles.countdownAlertText,
                        isVeryLowTime && styles.countdownAlertTextDanger,
                        !isVeryLowTime && styles.countdownAlertTextWarning,
                      ]}
                    >
                      {isVeryLowTime ? "Time almost up!" : "Low time remaining"}
                    </Text>
                  </View>
                )}
              </View>

              {order.status === "delivered" && (
                <Button
                  title="Extend Rental"
                  onPress={handleExtendRental}
                  icon={<Plus size={20} color={colors.textWhite} />}
                  style={styles.extendButton}
                />
              )}
            </View>
          </Card>
        )}

        {/* Status Card */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>
              {totalQuantity > 0
                ? `${totalQuantity} Beanbag${totalQuantity > 1 ? "s" : ""}`
                : "Beanbag"}
            </Text>
            {getStatusBadge(order.status, order.paymentStatus)}
          </View>

          <View style={styles.statusProgressContainer}>
            {/* Progress Line */}
            <View style={styles.progressLine}>
              <View
                style={[
                  styles.progressLineFill,
                  { width: `${(statusStep / 3) * 100}%` },
                ]}
              />
            </View>

            {/* Steps */}
            <View style={styles.statusSteps}>
              {["Confirmed", "On the way", "Delivered", "Collected"].map(
                (step, i) => {
                  const isCompleted = statusStep > i;
                  const isCurrent = statusStep === i;
                  const isPending = statusStep < i;

                  return (
                    <View key={step} style={styles.statusStep}>
                      <View
                        style={[
                          styles.statusStepCircle,
                          (isCompleted || isCurrent) &&
                            styles.statusStepCircleActive,
                        ]}
                      >
                        {isCompleted || isCurrent ? (
                          <CheckCircle size={20} color={colors.textWhite} />
                        ) : (
                          <Circle
                            size={20}
                            color={
                              isCurrent
                                ? colors.primary
                                : colors.mutedForeground
                            }
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.statusStepText,
                          isCurrent && styles.statusStepTextActive,
                          isCompleted && styles.statusStepTextCompleted,
                          isPending && styles.statusStepTextPending,
                        ]}
                      >
                        {step}
                      </Text>
                    </View>
                  );
                }
              )}
            </View>
          </View>
        </Card>

        {/* Booking Information Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Booking Information</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoRowLeft}>
              <MapPin size={16} color={colors.mutedForeground} />
              <Text style={styles.infoRowLabel}>Beach</Text>
            </View>
            <Text style={styles.infoRowValue}>
              {order.beach?.name || "N/A"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoRowLeft}>
              <Timer size={16} color={colors.mutedForeground} />
              <Text style={styles.infoRowLabel}>Type</Text>
            </View>
            <Text style={styles.infoRowValue}>
              {order.bookingType === "order_now"
                ? "Instant Delivery"
                : "Pre-Booked"}
            </Text>
          </View>

          {order.scheduledDate && (
            <View style={styles.infoRow}>
              <View style={styles.infoRowLeft}>
                <Calendar size={16} color={colors.mutedForeground} />
                <Text style={styles.infoRowLabel}>Scheduled</Text>
              </View>
              <Text style={styles.infoRowValue}>
                {format(new Date(order.scheduledDate), "PPP")}
                {order.scheduledTime && ` at ${order.scheduledTime}`}
              </Text>
            </View>
          )}

          {order.items && order.items.length > 0 ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLabel}>Items</Text>
                <Text
                  style={[styles.infoRowValue, styles.infoRowValueCapitalize]}
                >
                  {orderSizes}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLabel}>Total Quantity</Text>
                <Text style={styles.infoRowValue}>{totalQuantity}</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLabel}>Size</Text>
                <Text
                  style={[styles.infoRowValue, styles.infoRowValueCapitalize]}
                >
                  {order.items?.[0]?.size || "N/A"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLabel}>Quantity</Text>
                <Text style={styles.infoRowValue}>
                  {order.items?.[0]?.quantity || 0}
                </Text>
              </View>
            </>
          )}

          <View style={styles.infoRow}>
            <View style={styles.infoRowLeft}>
              <Clock size={16} color={colors.mutedForeground} />
              <Text style={styles.infoRowLabel}>Duration</Text>
            </View>
            <Text style={styles.infoRowValue}>
              {order.durationHours} hour{order.durationHours > 1 ? "s" : ""}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoRowLeft}>
              <CreditCard size={16} color={colors.mutedForeground} />

              <Text style={styles.infoRowLabel}>Payment</Text>
            </View>
            <Text style={styles.infoRowValue}>
              {order.paymentMethod === "stripe" ? "Card" : "Cash on Delivery"}
            </Text>
          </View>

          {/* Payment Required Section */}
          {order.paymentStatus === "pending" &&
            order.paymentMethod === "stripe" &&
            order.status !== "cancelled" && (
              <Card style={styles.paymentRequiredCard}>
                <View style={styles.paymentRequiredContent}>
                  <View style={styles.paymentRequiredIcon}>
                    <CreditCard size={24} color={colors.primary} />
                  </View>
                  <View style={styles.paymentRequiredText}>
                    <Text style={styles.paymentRequiredTitle}>
                      Payment Required
                    </Text>
                    <Text style={styles.paymentRequiredDescription}>
                      Complete your payment to confirm and secure your booking.
                    </Text>
                  </View>
                  <Button
                    title="Pay Now"
                    onPress={handlePayNow}
                    icon={<CreditCard size={16} color={colors.textWhite} />}
                    style={styles.payNowButton}
                  />
                </View>
              </Card>
            )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              AED {parseFloat(order.totalPrice || 0).toFixed(2)}
            </Text>
          </View>
        </Card>

        {/* Help Card */}
        <Card style={styles.helpCard}>
          <Text style={styles.helpCardTitle}>Need Help?</Text>
          <Button
            title="Call Support"
            onPress={handleCallSupport}
            variant="outline"
            icon={<Phone size={20} color={colors.primary} />}
            style={styles.helpButton}
          />
          <Button
            title="Chat with Us"
            onPress={handleChatSupport}
            variant="outline"
            icon={<MessageCircle size={20} color={colors.primary} />}
            style={styles.helpButton}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

function LoadingSkeleton() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Skeleton width="100%" height={32} style={styles.skeleton} />
        <Skeleton width="100%" height={200} style={styles.skeleton} />
        <Skeleton width="100%" height={300} style={styles.skeleton} />
        <Skeleton width="100%" height={200} style={styles.skeleton} />
      </ScrollView>
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
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: isTablet ? fontSizes.displaySmall : fontSizes.h1,
    fontWeight: "700",
    color: colors.foreground,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  countdownCard: {
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  countdownCardWarning: {
    borderColor: colors.warning,
  },
  countdownCardDanger: {
    borderColor: colors.error,
  },
  countdownContent: {
    padding: spacing.lg,
  },
  countdownHeader: {
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: withOpacity(colors.primary, 0.05),
  },
  countdownHeaderWarning: {
    backgroundColor: withOpacity(colors.warning, 0.05),
  },
  countdownHeaderDanger: {
    backgroundColor: withOpacity(colors.error, 0.05),
  },
  countdownLabel: {
    fontSize: fontSizes.bodySmall,
    color: colors.mutedForeground,
    marginBottom: spacing.sm,
  },
  countdownTime: {
    fontSize: isTablet ? 64 : 48,
    fontWeight: "700",
    fontFamily: "monospace",
    color: colors.primary,
    marginBottom: spacing.md,
  },
  countdownTimeWarning: {
    color: colors.warning,
  },
  countdownTimeDanger: {
    color: colors.error,
  },
  countdownProgress: {
    marginTop: spacing.md,
    height: 8,
    width: "100%",
  },
  countdownAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  countdownAlertText: {
    fontSize: fontSizes.bodySmall,
    fontWeight: "500",
    color: colors.warning,
  },
  countdownAlertTextWarning: {
    color: colors.warning,
  },
  countdownAlertTextDanger: {
    color: colors.error,
  },
  extendButton: {
    marginTop: spacing.lg,
  },
  statusCard: {
    marginBottom: spacing.lg,
    padding: 10,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  statusTitle: {
    fontSize: fontSizes.h3,
    fontWeight: "700",
    color: colors.foreground,
    textTransform: "capitalize",
  },
  badgeCustom: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  badgeCustomText: {
    fontSize: fontSizes.caption,
    fontWeight: "600",
  },
  statusProgressContainer: {
    position: "relative",
  },
  progressLine: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.muted,
    zIndex: 0,
  },
  progressLineFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  statusSteps: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 1,
  },
  statusStep: {
    flex: 1,
    alignItems: "center",
  },
  statusStepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  statusStepCircleActive: {
    backgroundColor: colors.primary,
  },
  statusStepText: {
    fontSize: fontSizes.caption,
    fontWeight: "500",
    textAlign: "center",
    color: colors.mutedForeground,
    paddingHorizontal: spacing.xs,
  },
  statusStepTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  statusStepTextCompleted: {
    color: colors.foreground,
  },
  statusStepTextPending: {
    color: colors.mutedForeground,
  },
  infoCard: {
    marginBottom: spacing.lg,
    padding: 10,
  },
  infoCardTitle: {
    fontSize: fontSizes.h3,
    fontWeight: "700",
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  infoRowLabel: {
    fontSize: fontSizes.bodySmall,
    color: colors.mutedForeground,
  },
  infoRowValue: {
    fontSize: fontSizes.bodySmall,
    fontWeight: "500",
    color: colors.foreground,
    textAlign: "right",
    flex: 1,
  },
  infoRowValueCapitalize: {
    textTransform: "capitalize",
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  paymentBadge: {
    // Badge styling handled by Badge component
  },
  paymentRequiredCard: {
    marginTop: spacing.lg,
    marginHorizontal: -spacing.md,
    borderWidth: 2,
    borderColor: withOpacity(colors.primary, 0.2),
    backgroundColor: withOpacity(colors.primary, 0.05),
    alignSelf: "center",
    padding: 10,
  },
  paymentRequiredContent: {
    flexDirection: isTablet ? "row" : "column",
    alignItems: isTablet ? "center" : "flex-start",
    gap: spacing.md,
  },
  paymentRequiredIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: withOpacity(colors.primary, 0.1),
    alignItems: "center",
    justifyContent: "center",
  },
  paymentRequiredText: {
    flex: 1,
  },
  paymentRequiredTitle: {
    fontSize: fontSizes.h3,
    fontWeight: "600",
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  paymentRequiredDescription: {
    fontSize: fontSizes.bodySmall,
    color: colors.mutedForeground,
  },
  payNowButton: {
    minWidth: isTablet ? 120 : "100%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: fontSizes.h3,
    fontWeight: "600",
    color: colors.foreground,
  },
  totalValue: {
    fontSize: fontSizes.h3,
    fontWeight: "700",
    color: colors.foreground,
  },
  helpCard: {
    marginBottom: spacing.lg,
  },
  helpCardTitle: {
    fontSize: fontSizes.h3,
    fontWeight: "700",
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  helpButton: {
    marginBottom: spacing.sm,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: fontSizes.h2,
    fontWeight: "600",
    color: colors.foreground,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  errorButton: {
    marginTop: spacing.md,
  },
  skeleton: {
    marginBottom: spacing.lg,
  },
});

export default BookingDetailsScreen;
