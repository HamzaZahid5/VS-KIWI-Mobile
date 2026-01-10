/**
 * BookingCard Component
 * Booking card component matching web app exactly
 * Reference: client/src/components/BookingCard.tsx
 */

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  AlertCircle,
  Plus,
} from "lucide-react-native";
import { format } from "date-fns";
import { colors, fontSizes, spacing, borderRadius, shadows } from "../theme";
import { withOpacity } from "../utils/colorHelper";
import Badge from "./Badge";
import Progress from "./Progress";

// BookingCard component matching web app logic exactly
// Reference: client/src/components/BookingCard.tsx
const BookingCard = ({ order, onPress }) => {
  const navigation = useNavigation();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!order.deliveredAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const deliveredAt = new Date(order.deliveredAt).getTime();

      let endsAt;
      if (order.countdownEndsAt) {
        endsAt = new Date(order.countdownEndsAt).getTime();
      } else {
        endsAt = deliveredAt + order.durationHours * 60 * 60 * 1000;
      }

      const startedAt = order.countdownStartedAt
        ? new Date(order.countdownStartedAt).getTime()
        : deliveredAt;

      const remaining = Math.max(0, endsAt - now);
      const total = endsAt - startedAt;

      setTimeRemaining(remaining);
      const elapsed = total - remaining;
      setProgress(total > 0 ? (elapsed / total) * 100 : 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [
    order.deliveredAt,
    order.countdownEndsAt,
    order.countdownStartedAt,
    order.durationHours,
  ]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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

  const isLowTime = timeRemaining > 0 && timeRemaining < 10 * 60 * 1000;
  const isVeryLowTime = timeRemaining > 0 && timeRemaining < 60 * 1000;
  const hasActiveCountdown =
    order.deliveredAt && (order.countdownEndsAt || order.durationHours);

  const totalPrice = parseFloat(order.totalPrice?.toString() || "0");
  const totalBeanbags =
    order.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;

  const borderColor = isVeryLowTime
    ? colors.error
    : isLowTime
    ? colors.warning
    : colors.border;

  return (
    <View style={[styles.card, { borderColor }, shadows.medium]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.bookingId}>
            Booking #{order.id?.slice(0, 8) || "N/A"}
          </Text>
          {getStatusBadge(order.status, order.paymentStatus)}
        </View>

        <Text style={styles.location}>
          {order.beach?.name || "Unknown Location"}
        </Text>

        {hasActiveCountdown && (
          <View
            style={[
              styles.countdownContainer,
              isVeryLowTime && styles.countdownContainerDanger,
              isLowTime && !isVeryLowTime && styles.countdownContainerWarning,
            ]}
          >
            <Text
              style={[
                styles.countdownText,
                isVeryLowTime && styles.countdownTextDanger,
                isLowTime && !isVeryLowTime && styles.countdownTextWarning,
              ]}
            >
              {formatTime(timeRemaining)}
            </Text>
            <Text style={styles.countdownLabel}>Time remaining</Text>
            <Progress
              value={progress}
              style={styles.progress}
              barStyle={
                isVeryLowTime
                  ? { backgroundColor: colors.error }
                  : isLowTime
                  ? { backgroundColor: colors.warning }
                  : null
              }
            />
            {isLowTime && (
              <View
                style={[
                  styles.alertContainer,
                  isVeryLowTime && styles.alertContainerDanger,
                  !isVeryLowTime && styles.alertContainerWarning,
                ]}
              >
                <AlertCircle
                  size={16}
                  color={isVeryLowTime ? colors.error : colors.warning}
                />
                <Text
                  style={[
                    styles.alertText,
                    isVeryLowTime && styles.alertTextDanger,
                    !isVeryLowTime && styles.alertTextWarning,
                  ]}
                >
                  Low time remaining
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.details}>
          {order.scheduledDate && (
            <View style={styles.detailRow}>
              <Calendar size={20} color={colors.primary} />
              <Text style={styles.detailText}>
                {format(new Date(order.scheduledDate), "MMM d, yyyy")}
                {order.scheduledTime && ` at ${order.scheduledTime}`}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <MapPin size={20} color={colors.primary} />
            <Text style={styles.detailText}>
              {totalBeanbags} Beanbag{totalBeanbags > 1 ? "s" : ""}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.detailText}>
              {order.durationHours} hour{order.durationHours > 1 ? "s" : ""}{" "}
              rental
            </Text>
          </View>

          <View style={styles.detailRow}>
            <DollarSign size={20} color={colors.primary} />
            <Text style={[styles.detailText, styles.priceText]}>
              ${totalPrice.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
          {order.status === "delivered" && (
            <TouchableOpacity
              style={styles.extendButton}
              onPress={() => {
                // Handle Extend button - matching web app logic exactly
                // Web app: <Link to={`/booking/${order.id}/extend`}>
                // Mobile: Navigate to ExtendBooking with orderId using parent navigator
                const parent = navigation.getParent();
                if (parent) {
                  parent.navigate("ExtendBooking", { orderId: order.id });
                } else {
                  navigation.navigate("ExtendBooking", { orderId: order.id });
                }
              }}
              activeOpacity={0.7}
            >
              <Plus size={16} color={colors.primaryForeground} />
              <Text style={styles.extendButtonText}>Extend</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.large,
    borderWidth: 1,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  bookingId: {
    fontSize: fontSizes.bodySmall,
    color: colors.mutedForeground,
    fontWeight: "500",
  },
  badgeCustom: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    alignSelf: "flex-start",
  },
  badgeCustomText: {
    fontSize: fontSizes.caption,
    fontWeight: "600",
  },
  location: {
    fontSize: fontSizes.h3,
    fontWeight: "700",
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  countdownContainer: {
    marginVertical: spacing.md,
    padding: spacing.md,
    backgroundColor: withOpacity(colors.primary, 0.05),
    borderRadius: borderRadius.medium,
    alignItems: "center",
  },
  countdownContainerWarning: {
    backgroundColor: withOpacity(colors.warning, 0.05),
  },
  countdownContainerDanger: {
    backgroundColor: withOpacity(colors.error, 0.05),
  },
  countdownText: {
    fontSize: 40,
    fontWeight: "700",
    color: colors.primary,
    fontFamily: "monospace",
  },
  countdownTextWarning: {
    color: colors.warning,
  },
  countdownTextDanger: {
    color: colors.error,
  },
  countdownLabel: {
    fontSize: fontSizes.bodySmall,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },
  progress: {
    marginTop: spacing.md,
    height: 8,
  },
  alertContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  alertContainerWarning: {
    // Warning styles
  },
  alertContainerDanger: {
    // Danger styles
  },
  alertText: {
    fontSize: fontSizes.bodySmall,
    fontWeight: "500",
    color: colors.warning,
  },
  alertTextWarning: {
    color: colors.warning,
  },
  alertTextDanger: {
    color: colors.error,
  },
  details: {
    gap: spacing.sm,
    marginVertical: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  detailText: {
    fontSize: fontSizes.bodySmall,
    color: colors.mutedForeground,
  },
  priceText: {
    fontWeight: "600",
    color: colors.foreground,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  viewButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: withOpacity(colors.primary, 0.1),
    borderRadius: borderRadius.medium,
    alignItems: "center",
  },
  viewButtonText: {
    fontSize: fontSizes.bodySmall,
    fontWeight: "500",
    color: colors.primary,
  },
  extendButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
  },
  extendButtonText: {
    fontSize: fontSizes.bodySmall,
    fontWeight: "500",
    color: colors.primaryForeground,
  },
});

export default BookingCard;
