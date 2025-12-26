/**
 * Confirm Step Component
 * Review and confirm booking
 */

import React from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import {
  MapPin,
  Timer,
  Calendar as CalendarIcon,
  Package,
  Clock,
  CreditCard,
  Receipt,
} from "lucide-react-native";
import { format } from "date-fns";
import { colors, spacing, fontSizes, borderRadius } from "../../theme";
import {
  selectBookingData,
  setTermsAccepted,
} from "../../redux/bookingFlowSlice";
import { useDispatch, useSelector } from "react-redux";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import Checkbox from "../../components/Checkbox";

const ConfirmStep = ({
  selectedBeach,
  basePrice,
  discount,
  totalPrice,
  onConfirm,
  isLoading,
}) => {
  const dispatch = useDispatch();
  const bookingData = useSelector(selectBookingData);
  const { termsAccepted } = bookingData;

  const handleTermsChange = (value) => {
    dispatch(setTermsAccepted(value));
  };

  const handleConfirm = async () => {
    if (!termsAccepted) {
      Alert.alert("Terms Required", "Please accept the terms and conditions.");
      return;
    }
    if (!onConfirm) {
      Alert.alert("Error", "Confirm handler is not available");
      return;
    }
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error in handleConfirm:", error);
      Alert.alert("Error", error.message || "Failed to confirm booking");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Confirm Booking</Text>
        <Text style={styles.subtitle}>Review your booking details</Text>
      </View>

      <Card style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Receipt size={20} color={colors.primary} />
          <Text style={styles.summaryTitle}>Booking Summary</Text>
        </View>

        <View style={styles.summaryContent}>
          {/* Location */}
          <View style={styles.summaryItem}>
            <View style={styles.summaryItemLeft}>
              <View style={styles.summaryIcon}>
                <MapPin size={16} color={colors.primary} />
              </View>
              <View style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Location</Text>
                <Text style={styles.summaryValue}>
                  {selectedBeach?.name || "Selected Location"}
                </Text>
              </View>
            </View>
          </View>

          {/* Booking Type */}
          <View style={styles.summaryItem}>
            <View style={styles.summaryItemLeft}>
              <View style={styles.summaryIcon}>
                <Timer size={16} color={colors.primary} />
              </View>
              <View style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Booking Type</Text>
                <Badge
                  variant={
                    bookingData.bookingType === "order_now"
                      ? "default"
                      : "secondary"
                  }
                >
                  {bookingData.bookingType === "order_now"
                    ? "Instant Delivery"
                    : "Pre-Booked"}
                </Badge>
              </View>
            </View>
          </View>

          {/* Scheduled Date/Time */}
          {bookingData.bookingType === "pre_book" &&
            bookingData.scheduledDate && (
              <View style={styles.summaryItem}>
                <View style={styles.summaryItemLeft}>
                  <View style={styles.summaryIcon}>
                    <CalendarIcon size={16} color={colors.primary} />
                  </View>
                  <View style={styles.summaryText}>
                    <Text style={styles.summaryLabel}>Scheduled</Text>
                    <Text style={styles.summaryValue}>
                      {format(
                        bookingData.scheduledDate instanceof Date
                          ? bookingData.scheduledDate
                          : new Date(bookingData.scheduledDate),
                        "PPP"
                      )}
                    </Text>
                    <Text style={styles.summarySubValue}>
                      at {bookingData.scheduledTime}
                    </Text>
                  </View>
                </View>
              </View>
            )}

          {/* Sizes & Quantities */}
          <View style={styles.summaryItem}>
            <View style={styles.summaryItemLeft}>
              <View style={styles.summaryIcon}>
                <Package size={16} color={colors.primary} />
              </View>
              <View style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Sizes & Quantities</Text>
                {bookingData.selectedSizes.length > 0 ? (
                  <View style={styles.sizesList}>
                    {bookingData.selectedSizes.map((sq) => (
                      <View key={sq.size} style={styles.sizeItem}>
                        <View
                          style={[
                            styles.sizeDot,
                            sq.size === "small" && styles.sizeDotSmall,
                            sq.size === "medium" && styles.sizeDotMedium,
                            sq.size === "large" && styles.sizeDotLarge,
                          ]}
                        />
                        <Text style={styles.sizeText}>
                          {sq.size} × {sq.quantity}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.summarySubValue}>None selected</Text>
                )}
              </View>
            </View>
          </View>

          {/* Duration & Payment */}
          <View style={styles.summaryItem}>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryGridItem}>
                <Clock size={16} color={colors.textMuted} />
                <Text style={styles.summaryGridLabel}>Duration</Text>
                <Text style={styles.summaryGridValue}>
                  {bookingData.durationHours} hour
                  {bookingData.durationHours > 1 ? "s" : ""}
                </Text>
              </View>
              <View style={styles.summaryGridItem}>
                <CreditCard size={16} color={colors.textMuted} />
                <Text style={styles.summaryGridLabel}>Payment</Text>
                <Text style={styles.summaryGridValue}>
                  {bookingData.paymentMethod === "stripe"
                    ? "Card"
                    : "Cash on Delivery"}
                </Text>
              </View>
            </View>
          </View>

          {/* Pricing */}
          <View style={styles.pricingSection}>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Subtotal</Text>
              <Text style={styles.pricingValue}>
                AED {basePrice.toFixed(2)}
              </Text>
            </View>
            {discount > 0 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabelDiscount}>Discount</Text>
                <Text style={styles.pricingValueDiscount}>
                  -AED {discount.toFixed(2)}
                </Text>
              </View>
            )}
            <View style={styles.pricingTotal}>
              <Text style={styles.pricingTotalLabel}>Total</Text>
              <Text style={styles.pricingTotalValue}>
                AED {totalPrice.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Terms & Conditions */}
      <Card style={styles.termsCard}>
        <View style={styles.termsContent}>
          <Checkbox
            checked={termsAccepted}
            onPress={() => handleTermsChange(!termsAccepted)}
          />
          <Text style={styles.termsText}>
            I accept the{" "}
            <Text style={styles.termsLink}>Terms & Conditions</Text> and{" "}
            <Text style={styles.termsLink}>Rental Agreement</Text>
          </Text>
        </View>
      </Card>

      <Button
        title={`Confirm & Pay AED ${totalPrice.toFixed(2)}`}
        onPress={handleConfirm}
        disabled={!termsAccepted || isLoading}
        loading={isLoading}
        style={styles.confirmButton}
      />
    </ScrollView>
  );
};

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
  summaryCard: {
    borderColor: colors.primary + "30",
    marginBottom: spacing.md,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.primary + "10",
    borderBottomWidth: 1,
    borderBottomColor: colors.primary + "30",
  },
  summaryTitle: {
    fontSize: fontSizes.xl,
    fontWeight: "600",
    color: colors.text,
  },
  summaryContent: {
    padding: spacing.lg,
  },
  summaryItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryItemLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary + "10",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryText: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: fontSizes.xs,
    fontWeight: "500",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs / 2,
  },
  summaryValue: {
    fontSize: fontSizes.base,
    fontWeight: "600",
    color: colors.text,
  },
  summarySubValue: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs / 2,
  },
  sizesList: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  sizeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.muted + "80",
    borderRadius: borderRadius.sm,
  },
  sizeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  sizeDotSmall: {
    backgroundColor: colors.primary + "66",
  },
  sizeDotMedium: {
    backgroundColor: colors.primary + "99",
  },
  sizeDotLarge: {
    backgroundColor: colors.primary,
  },
  sizeText: {
    fontSize: fontSizes.sm,
    fontWeight: "500",
    color: colors.text,
    textTransform: "capitalize",
  },
  summaryGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  summaryGridItem: {
    flex: 1,
    gap: spacing.xs,
  },
  summaryGridLabel: {
    fontSize: fontSizes.xs,
    fontWeight: "500",
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  summaryGridValue: {
    fontSize: fontSizes.base,
    fontWeight: "600",
    color: colors.text,
  },
  pricingSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 2,
    borderTopColor: colors.primary + "30",
    gap: spacing.sm,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pricingLabel: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  pricingValue: {
    fontSize: fontSizes.sm,
    fontWeight: "500",
    color: colors.text,
  },
  pricingLabelDiscount: {
    fontSize: fontSizes.sm,
    fontWeight: "500",
    color: colors.primary,
  },
  pricingValueDiscount: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.primary,
  },
  pricingTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.primary + "30",
  },
  pricingTotalLabel: {
    fontSize: fontSizes.base,
    fontWeight: "600",
    color: colors.text,
  },
  pricingTotalValue: {
    fontSize: fontSizes["2xl"],
    fontWeight: "700",
    color: colors.primary,
  },
  termsCard: {
    marginBottom: spacing.md,
  },
  termsContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
  },
  termsText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    textDecorationLine: "underline",
  },
  confirmButton: {
    marginTop: spacing.md,
  },
});

export default ConfirmStep;
