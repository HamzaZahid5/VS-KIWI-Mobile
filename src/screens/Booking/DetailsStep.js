/**
 * Details Step Component
 * Select beanbag sizes, quantities, and duration
 */

import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Minus,
  Clock,
  Calendar,
  Receipt,
  AlertCircle,
  ChevronRight,
} from "lucide-react-native";
import { format, addMinutes } from "date-fns";
import { colors, spacing, fontSizes, borderRadius, shadows } from "../../theme";
import {
  selectBookingData,
  selectHourlyRate,
  toggleSize,
  setQuantity,
  setDuration,
  nextStep,
} from "../../redux/bookingFlowSlice";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import Skeleton from "../../components/Skeleton";
import Checkbox from "../../components/Checkbox";

const DetailsStep = ({ beachData, isLoading }) => {
  const dispatch = useDispatch();
  const bookingData = useSelector(selectBookingData);
  const hourlyRate = useSelector(selectHourlyRate);
  const {
    bookingType,
    scheduledDate,
    scheduledTime,
    selectedSizes,
    durationHours,
  } = bookingData;

  // Calculate available hours
  const availableHours = useMemo(() => {
    if (!beachData?.serviceStartTime || !beachData?.serviceEndTime) return [];
    const [serviceStartHour] = beachData.serviceStartTime
      .split(":")
      .map(Number);
    const [serviceEndHour] = beachData.serviceEndTime.split(":").map(Number);

    if (bookingType === "pre_book" && scheduledTime) {
      const [scheduledHour] = scheduledTime.split(":").map(Number);
      const maxHours = Math.min(serviceEndHour - scheduledHour, 8);
      if (maxHours <= 0) return [];
      return Array.from({ length: maxHours }, (_, i) => i + 1);
    }

    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour < serviceStartHour) {
      const maxHours = Math.min(serviceEndHour - serviceStartHour, 8);
      return Array.from({ length: maxHours }, (_, i) => i + 1);
    }
    if (currentHour >= serviceEndHour) return [];
    let remainingHours = serviceEndHour - currentHour;
    if (remainingHours <= 0) return [];
    return Array.from({ length: remainingHours }, (_, i) => i + 1);
  }, [beachData, bookingType, scheduledTime]);

  // Calculate estimated times
  const estimatedTimes = useMemo(() => {
    const now = new Date();
    if (bookingType === "pre_book" && scheduledDate && scheduledTime) {
      const [hour, minute] = scheduledTime.split(":").map(Number);
      const scheduledDateTime = new Date(scheduledDate);
      scheduledDateTime.setHours(hour, minute || 0, 0, 0);
      const deliveryStart = scheduledDateTime;
      const deliveryEnd = addMinutes(scheduledDateTime, 10);
      const rentalEndStart = addMinutes(deliveryStart, durationHours * 60);
      const rentalEndEnd = addMinutes(deliveryEnd, durationHours * 60);
      return {
        deliveryStart: format(deliveryStart, "h:mm a"),
        deliveryEnd: format(deliveryEnd, "h:mm a"),
        rentalEndStart: format(rentalEndStart, "h:mm a"),
        rentalEndEnd: format(rentalEndEnd, "h:mm a"),
        isPreBook: true,
      };
    }
    const deliveryStart = addMinutes(now, 5);
    const deliveryEnd = addMinutes(now, 10);
    const rentalEndStart = addMinutes(deliveryStart, durationHours * 60);
    const rentalEndEnd = addMinutes(deliveryEnd, durationHours * 60);
    return {
      deliveryStart: format(deliveryStart, "h:mm a"),
      deliveryEnd: format(deliveryEnd, "h:mm a"),
      rentalEndStart: format(rentalEndStart, "h:mm a"),
      rentalEndEnd: format(rentalEndEnd, "h:mm a"),
      isPreBook: false,
    };
  }, [bookingType, scheduledDate, scheduledTime, durationHours]);

  // Get available sizes from inventory
  const sizes = useMemo(() => {
    if (!beachData?.inventory?.length) return [];
    return beachData.inventory
      .filter((inv) => inv.isActive !== false && inv.availableQuantity > 0)
      .map((inv, index) => ({
        value: inv.size,
        label: inv.size,
        priceMultiplier: (index + 1) * 1.2,
        availableQuantity: inv.availableQuantity,
      }));
  }, [beachData?.inventory]);

  const isSizeSelected = (size) => {
    return selectedSizes.some((sq) => sq.size === size);
  };

  const getSizeQuantity = (size) => {
    return selectedSizes.find((sq) => sq.size === size)?.quantity || 1;
  };

  const calculateEstimatedTotal = () => {
    return selectedSizes.reduce((total, sq) => {
      const sizeInfo = sizes.find((s) => s.value === sq.size);
      const rate = hourlyRate * (sizeInfo?.priceMultiplier || 1);
      return total + rate * durationHours * sq.quantity;
    }, 0);
  };

  const estimatedTotal = calculateEstimatedTotal();

  const canProceed =
    selectedSizes.length > 0 && availableHours.length > 0 && durationHours > 0;

  if (isLoading) {
    return <DetailsStepSkeleton />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Booking Details</Text>
        <Text style={styles.subtitle}>
          Choose your beanbag size, quantity, and duration
        </Text>
      </View>

      {/* Booking Type Info */}
      {bookingType === "pre_book" && scheduledDate && scheduledTime ? (
        <View style={styles.infoBanner}>
          <Calendar size={16} color={colors.primary} />
          <Text style={styles.infoText}>
            Scheduled:{" "}
            {format(
              scheduledDate instanceof Date
                ? scheduledDate
                : new Date(scheduledDate),
              "EEE, MMM d"
            )}{" "}
            at {scheduledTime}
          </Text>
          <Badge variant="outline">Pre-Booked</Badge>
        </View>
      ) : (
        <View style={styles.infoBanner}>
          <Clock size={16} color={colors.primary} />
          <Text style={styles.infoText}>Order Now (Immediate Delivery)</Text>
        </View>
      )}

      {/* Service Hours */}
      {beachData?.serviceStartTime && beachData?.serviceEndTime && (
        <View style={styles.infoBanner}>
          <Clock size={16} color={colors.primary} />
          <Text style={styles.infoText}>
            Service Hours: {beachData.serviceStartTime} -{" "}
            {beachData.serviceEndTime}
          </Text>
        </View>
      )}

      {/* Size Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Size</Text>
        {sizes.length === 0 ? (
          <Card style={styles.emptyCard}>
            <AlertCircle size={32} color={colors.textMuted} />
            <Text style={styles.emptyText}>No beanbags available</Text>
          </Card>
        ) : (
          <View style={styles.sizesGrid}>
            {sizes.map((s) => {
              const isSelected = isSizeSelected(s.value);
              return (
                <View key={s.value} style={styles.sizeContainer}>
                  <Card
                    style={[
                      styles.sizeCard,
                      isSelected && styles.sizeCardSelected,
                    ]}
                  >
                    <View style={styles.sizeCardContent}>
                      <TouchableOpacity
                        onPress={() => dispatch(toggleSize(s.value))}
                        activeOpacity={0.7}
                        style={styles.sizeCardLeft}
                      >
                        <Checkbox
                          checked={isSelected}
                          onPress={() => dispatch(toggleSize(s.value))}
                        />
                        <View
                          style={[
                            styles.sizeIndicator,
                            s.value === "small" && styles.sizeIndicatorSmall,
                            s.value === "medium" && styles.sizeIndicatorMedium,
                            s.value === "large" && styles.sizeIndicatorLarge,
                          ]}
                        >
                          <View
                            style={[
                              styles.sizeDot,
                              s.value === "small" && styles.sizeDotSmall,
                              s.value === "medium" && styles.sizeDotMedium,
                              s.value === "large" && styles.sizeDotLarge,
                            ]}
                          />
                        </View>
                        <View style={styles.sizeInfo}>
                          <Text
                            style={styles.sizeLabel}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {s.label}
                          </Text>
                          <Text
                            style={styles.sizeAvailability}
                            numberOfLines={1}
                          >
                            {s.availableQuantity} Available
                          </Text>
                        </View>
                      </TouchableOpacity>
                      {isSelected && (
                        <View style={styles.quantityControls}>
                          <Text style={styles.quantityLabel}>Quantity</Text>
                          <View style={styles.quantityRow}>
                            <TouchableOpacity
                              onPress={() =>
                                dispatch(
                                  setQuantity({
                                    size: s.value,
                                    quantity: Math.max(
                                      1,
                                      getSizeQuantity(s.value) - 1
                                    ),
                                  })
                                )
                              }
                              disabled={getSizeQuantity(s.value) <= 1}
                              style={[
                                styles.quantityButton,
                                getSizeQuantity(s.value) <= 1 &&
                                  styles.quantityButtonDisabled,
                              ]}
                            >
                              <Minus
                                size={16}
                                color={
                                  getSizeQuantity(s.value) <= 1
                                    ? colors.textMuted
                                    : colors.primary
                                }
                              />
                            </TouchableOpacity>
                            <Text style={styles.quantityValue}>
                              {getSizeQuantity(s.value)}
                            </Text>
                            <TouchableOpacity
                              onPress={() =>
                                dispatch(
                                  setQuantity({
                                    size: s.value,
                                    quantity: Math.min(
                                      s.availableQuantity,
                                      getSizeQuantity(s.value) + 1
                                    ),
                                  })
                                )
                              }
                              disabled={
                                getSizeQuantity(s.value) >= s.availableQuantity
                              }
                              style={[
                                styles.quantityButton,
                                getSizeQuantity(s.value) >=
                                  s.availableQuantity &&
                                  styles.quantityButtonDisabled,
                              ]}
                            >
                              <Plus
                                size={16}
                                color={
                                  getSizeQuantity(s.value) >=
                                  s.availableQuantity
                                    ? colors.textMuted
                                    : colors.primary
                                }
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                  </Card>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Duration Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Duration (hours)</Text>
        {availableHours.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Clock size={32} color={colors.textMuted} />
            <Text style={styles.emptyText}>Service currently closed</Text>
          </Card>
        ) : (
          <View style={styles.durationContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {availableHours.map((hours) => (
                <TouchableOpacity
                  key={hours}
                  onPress={() => dispatch(setDuration(hours))}
                  style={[
                    styles.durationOption,
                    durationHours === hours && styles.durationOptionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.durationText,
                      durationHours === hours && styles.durationTextSelected,
                    ]}
                  >
                    {hours} hour{hours > 1 ? "s" : ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {durationHours > 0 && (
              <Card style={styles.timingCard}>
                <View style={styles.timingHeader}>
                  <Clock size={16} color={colors.primary} />
                  <Text style={styles.timingTitle}>Estimated Timing</Text>
                </View>
                <View style={styles.timingGrid}>
                  <View style={styles.timingItem}>
                    <Text style={styles.timingLabel}>
                      {estimatedTimes.isPreBook
                        ? "Scheduled Delivery"
                        : "Est. Delivery"}
                    </Text>
                    <Text style={styles.timingValue}>
                      {estimatedTimes.deliveryStart} -{" "}
                      {estimatedTimes.deliveryEnd}
                    </Text>
                  </View>
                  <View style={styles.timingItem}>
                    <Text style={styles.timingLabel}>
                      {estimatedTimes.isPreBook
                        ? "Scheduled End"
                        : "Est. Rental Ends"}
                    </Text>
                    <Text style={styles.timingValue}>
                      {estimatedTimes.rentalEndStart} -{" "}
                      {estimatedTimes.rentalEndEnd}
                    </Text>
                  </View>
                </View>
                <Text style={styles.timingNote}>
                  Your {durationHours} hour{durationHours > 1 ? "s" : ""} rental
                  begins once delivered.
                </Text>
              </Card>
            )}
          </View>
        )}
      </View>

      {/* Estimated Total */}
      <Card style={styles.totalCard}>
        {selectedSizes.length > 0 ? (
          <View style={styles.totalContent}>
            <View style={styles.totalHeader}>
              <Receipt size={20} color={colors.primary} />
              <Text style={styles.totalLabel}>Estimated Total</Text>
              <Badge>
                {durationHours} hour{durationHours > 1 ? "s" : ""}
              </Badge>
            </View>
            <Text style={styles.totalAmount}>
              AED {estimatedTotal.toFixed(2)}
            </Text>
            <View style={styles.totalBreakdown}>
              {selectedSizes.map((sq) => {
                const sizeInfo = sizes.find((s) => s.value === sq.size);
                const itemRate = hourlyRate * (sizeInfo?.priceMultiplier || 1);
                const itemTotal = itemRate * durationHours * sq.quantity;
                return (
                  <View key={sq.size} style={styles.breakdownItem}>
                    <Text style={styles.breakdownLabel}>
                      {sizeInfo?.label} × {sq.quantity}
                    </Text>
                    <Text style={styles.breakdownValue}>
                      AED {itemTotal.toFixed(2)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.totalEmpty}>
            <Receipt size={48} color={colors.textMuted + "40"} />
            <Text style={styles.totalEmptyText}>Select sizes to see total</Text>
          </View>
        )}
      </Card>

      <Button
        title="Continue"
        onPress={() => dispatch(nextStep())}
        disabled={!canProceed}
        style={styles.continueButton}
        // icon={<ChevronRight size={20} color={colors.textWhite} />}
      />
    </ScrollView>
  );
};

function DetailsStepSkeleton() {
  return (
    <View style={styles.container}>
      <Skeleton width="100%" height={60} style={styles.skeleton} />
      <Skeleton width="100%" height={200} style={styles.skeleton} />
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
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primary + "10",
    borderRadius: borderRadius.medium,
    marginBottom: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.base,
    fontWeight: "500",
    color: colors.text,
    marginBottom: spacing.md,
  },
  sizesGrid: {
    gap: spacing.md,
  },
  sizeContainer: {
    width: "100%",
  },
  sizeCard: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.large,
    backgroundColor: colors.background,
    overflow: "hidden",
    ...shadows.small,
  },
  sizeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "05",
    ...shadows.medium,
  },
  sizeCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.sm,
    justifyContent: "space-between",
    minHeight: 80,
  },
  sizeCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
    minWidth: 0, // Allows flex to shrink properly
  },
  sizeIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sizeIndicatorSmall: {
    backgroundColor: colors.primary + "20",
  },
  sizeIndicatorMedium: {
    backgroundColor: colors.primary + "40",
  },
  sizeIndicatorLarge: {
    backgroundColor: colors.primary + "60",
  },
  sizeDot: {
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  sizeDotSmall: {
    width: 16,
    height: 16,
  },
  sizeDotMedium: {
    width: 24,
    height: 24,
  },
  sizeDotLarge: {
    width: 32,
    height: 32,
  },
  sizeInfo: {
    flex: 1,
    marginLeft: spacing.xs,
    minWidth: 0, // Allows text to wrap/truncate properly
  },
  sizeLabel: {
    fontSize: fontSizes.base,
    fontWeight: "700",
    color: colors.text,
    textTransform: "capitalize",
    marginBottom: spacing.xs / 2,
    numberOfLines: 1,
    ellipsizeMode: "tail",
  },
  sizeAvailability: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    fontWeight: "500",
    numberOfLines: 1,
  },
  quantityControls: {
    alignItems: "flex-end",
    marginLeft: spacing.sm,
    paddingLeft: spacing.sm,
    borderLeftWidth: 1,
    borderLeftColor: colors.border + "40",
    flexShrink: 0, // Prevents quantity controls from shrinking
    minWidth: 100, // Ensures quantity controls have enough space
  },
  quantityLabel: {
    fontSize: fontSizes.xs,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: spacing.xs + 5,
    paddingRight: 35,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    justifyContent: "center",
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonDisabled: {
    borderColor: colors.border,
    backgroundColor: colors.background,
    opacity: 0.5,
  },
  quantityValue: {
    fontSize: fontSizes.xl,
    fontWeight: "700",
    color: colors.primary,
    minWidth: 40,
    textAlign: "center",
  },
  durationContainer: {
    gap: spacing.md,
  },
  durationOption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginRight: spacing.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.medium,
  },
  durationOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationText: {
    fontSize: fontSizes.sm,
    color: colors.text,
  },
  durationTextSelected: {
    color: colors.textWhite,
    fontWeight: "600",
  },
  timingCard: {
    marginTop: spacing.md,
    backgroundColor: colors.primary + "05",
    borderColor: colors.primary + "30",
  },
  timingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  timingTitle: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.text,
  },
  timingGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  timingItem: {
    flex: 1,
    padding: spacing.sm,
    backgroundColor: colors.background + "99",
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border + "80",
  },
  timingLabel: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs / 2,
  },
  timingValue: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.primary,
  },
  timingNote: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  totalCard: {
    backgroundColor: colors.primary + "10",
    borderColor: colors.primary + "30",
    marginBottom: spacing.md,
  },
  totalContent: {
    padding: spacing.lg,
  },
  totalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  totalLabel: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  totalAmount: {
    fontSize: fontSizes["3xl"],
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.md,
  },
  totalBreakdown: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.primary + "30",
    gap: spacing.sm,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  breakdownLabel: {
    fontSize: fontSizes.sm,
    fontWeight: "500",
    color: colors.text,
  },
  breakdownValue: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.text,
  },
  totalEmpty: {
    padding: spacing.xl,
    alignItems: "center",
  },
  totalEmptyText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: "center",
    borderStyle: "dashed",
  },
  emptyText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  continueButton: {
    marginTop: spacing.md,
  },
  skeleton: {
    marginBottom: spacing.md,
  },
});

export default DetailsStep;
