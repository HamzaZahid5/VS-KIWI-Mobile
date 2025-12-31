/**
 * UpcomingBookingCard Component
 * Card component for displaying upcoming bookings
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  MapPin,
  Calendar,
  DollarSign,
} from "lucide-react-native";
import { format } from "date-fns";
import { colors, fontSizes, spacing, borderRadius, shadows } from "../theme";
import { withOpacity } from "../utils/colorHelper";
import Badge from "./Badge";

const UpcomingBookingCard = ({ booking, onPress }) => {
  return (
    <View style={styles.upcomingCard}>
      <View style={styles.upcomingHeader}>
        <View style={styles.upcomingHeaderLeft}>
          <Text style={styles.upcomingId}>
            Booking #{booking.id}
          </Text>
          <Text style={styles.upcomingLocation}>
            {booking.location}
          </Text>
        </View>
        <Badge
          style={[
            styles.upcomingBadge,
            {
              backgroundColor: withOpacity(colors.primary, 0.1),
            },
          ]}
          textStyle={{ color: colors.primary }}
        >
          Upcoming
        </Badge>
      </View>

      <View style={styles.upcomingDetails}>
        <View style={styles.upcomingDetailRow}>
          <Calendar size={18} color={colors.primary} />
          <Text style={styles.upcomingDetailText}>
            {format(new Date(booking.date), "MMM d, yyyy")}
          </Text>
        </View>

        <View style={styles.upcomingDetailRow}>
          <MapPin size={18} color={colors.primary} />
          <Text style={styles.upcomingDetailText}>
            {booking.beanbags} Beanbags
          </Text>
        </View>

        <View style={styles.upcomingDetailRow}>
          <DollarSign size={18} color={colors.primary} />
          <Text
            style={[
              styles.upcomingDetailText,
              styles.upcomingPrice,
            ]}
          >
            ${booking.price.toFixed(2)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.upcomingButton}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.upcomingButtonText}>
          View Details
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  upcomingCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xlarge,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.small,
  },
  upcomingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  upcomingHeaderLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  upcomingId: {
    fontSize: fontSizes.bodySmall,
    color: colors.mutedForeground,
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  upcomingLocation: {
    fontSize: fontSizes.h3,
    fontWeight: "700",
    color: colors.foreground,
  },
  upcomingBadge: {
    // Badge styling handled inline with backgroundColor
  },
  upcomingDetails: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  upcomingDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  upcomingDetailText: {
    fontSize: fontSizes.bodySmall,
    color: colors.mutedForeground,
  },
  upcomingPrice: {
    fontWeight: "600",
    color: colors.foreground,
  },
  upcomingButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary + "20",
    borderRadius: borderRadius.medium,
    alignItems: "center",
  },
  upcomingButtonText: {
    fontSize: fontSizes.bodySmall,
    fontWeight: "500",
    color: colors.primary,
  },
});

export default UpcomingBookingCard;

