/**
 * Payment Step Component
 * Select payment method
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { CreditCard, Banknote, Info, ChevronRight } from "lucide-react-native";
import { colors, spacing, fontSizes, borderRadius } from "../../theme";
import {
  selectBookingData,
  setPaymentMethod,
  nextStep,
} from "../../redux/bookingFlowSlice";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Badge from "../../components/Badge";

const PaymentStep = () => {
  const dispatch = useDispatch();
  const bookingData = useSelector(selectBookingData);
  const { paymentMethod, bookingType } = bookingData;
  const isPreBook = bookingType === "pre_book";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Method</Text>
        <Text style={styles.subtitle}>Choose how you'd like to pay</Text>
      </View>

      <View style={styles.options}>
        {/* Stripe Payment */}
        <TouchableOpacity
          onPress={() => dispatch(setPaymentMethod("stripe"))}
          activeOpacity={0.7}
        >
          <Card
            style={[
              styles.optionCard,
              paymentMethod === "stripe" && styles.optionCardSelected,
            ]}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionLeft}>
                <CreditCard size={20} color={colors.primary} />
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Card Payment</Text>
                  <Text style={styles.optionDescription}>
                    Credit/Debit card, Apple Pay, Google Pay
                  </Text>
                </View>
              </View>
              <Badge variant="outline">Recommended</Badge>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Cash on Delivery */}
        <TouchableOpacity
          onPress={() => !isPreBook && dispatch(setPaymentMethod("cod"))}
          disabled={isPreBook}
          activeOpacity={0.7}
        >
          <Card
            style={[
              styles.optionCard,
              paymentMethod === "cod" && styles.optionCardSelected,
              isPreBook && styles.optionCardDisabled,
            ]}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionLeft}>
                <Banknote
                  size={20}
                  color={isPreBook ? colors.textMuted : colors.primary}
                />
                <View style={styles.optionText}>
                  <Text
                    style={[
                      styles.optionTitle,
                      isPreBook && styles.optionTitleDisabled,
                    ]}
                  >
                    Cash on Delivery
                  </Text>
                  <Text style={styles.optionDescription}>
                    Pay when your beanbag arrives
                  </Text>
                  {isPreBook && (
                    <View style={styles.warningInfo}>
                      <Info size={14} color={colors.warning} />
                      <Text style={styles.warningText}>
                        Not available for pre-bookings
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      </View>

      <Button
        title="Continue"
        onPress={() => dispatch(nextStep())}
        style={styles.continueButton}
        // icon={<ChevronRight size={20} color={colors.textWhite} />}
      />
    </View>
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
  options: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  optionCard: {
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "05",
  },
  optionCardDisabled: {
    opacity: 0.5,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  optionTitleDisabled: {
    color: colors.textMuted,
  },
  optionDescription: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  warningInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  warningText: {
    fontSize: fontSizes.xs,
    color: colors.warning,
  },
  continueButton: {
    marginTop: spacing.md,
  },
});

export default PaymentStep;
