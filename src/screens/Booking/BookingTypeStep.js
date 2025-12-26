/**
 * Booking Type Step Component
 * Choose between Order Now or Pre-Book
 */

import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  Timer,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  ChevronRight,
} from "lucide-react-native";
import { format, isToday, isBefore, startOfDay } from "date-fns";
import { colors, spacing, fontSizes, borderRadius } from "../../theme";
import {
  selectBookingData,
  setBookingType,
  setScheduledDate,
  setScheduledTime,
  nextStep,
} from "../../redux/bookingFlowSlice";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import Skeleton from "../../components/Skeleton";
import DatePicker from "../../components/DatePicker";

const BookingTypeStep = ({ serviceStartTime, serviceEndTime, isLoading }) => {
  const dispatch = useDispatch();
  const bookingData = useSelector(selectBookingData);
  const { bookingType, scheduledDate, scheduledTime } = bookingData;

  // Check if service is currently available
  const isServiceOpen = useMemo(() => {
    if (!serviceStartTime || !serviceEndTime) return false;
    const now = new Date();
    const currentHour = now.getHours();
    const [startHour] = serviceStartTime.split(":").map(Number);
    const [endHour] = serviceEndTime.split(":").map(Number);
    return currentHour >= startHour && currentHour < endHour;
  }, [serviceStartTime, serviceEndTime]);

  // Generate available time slots
  const availableTimeSlots = useMemo(() => {
    if (!serviceStartTime || !serviceEndTime) return [];
    const [startHour] = serviceStartTime.split(":").map(Number);
    const [endHour] = serviceEndTime.split(":").map(Number);
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
    }
    return slots;
  }, [serviceStartTime, serviceEndTime]);

  // Filter time slots for today (only show future times, allow booking at least 30 minutes from now)
  const filteredTimeSlots = useMemo(() => {
    if (!scheduledDate || !isToday(scheduledDate)) return availableTimeSlots;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    return availableTimeSlots.filter((slot) => {
      const [slotHour] = slot.split(":").map(Number);
      // Allow booking at least 30 minutes from now
      if (slotHour === currentHour && currentMinutes > 30) return false;
      return slotHour > currentHour;
    });
  }, [scheduledDate, availableTimeSlots]);

  const canProceed = useMemo(() => {
    if (bookingType === "order_now") {
      return isServiceOpen;
    }
    return (
      scheduledDate &&
      scheduledTime &&
      filteredTimeSlots.includes(scheduledTime)
    );
  }, [
    bookingType,
    isServiceOpen,
    scheduledDate,
    scheduledTime,
    filteredTimeSlots,
  ]);

  const handleDateChange = (date) => {
    dispatch(setScheduledDate(date));
    if (date && isToday(date) && scheduledTime) {
      const now = new Date();
      const currentHour = now.getHours();
      const [slotHour] = scheduledTime.split(":").map(Number);
      if (slotHour <= currentHour) {
        dispatch(setScheduledTime(""));
      }
    }
  };

  if (isLoading) {
    return <BookingTypeStepSkeleton />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>When do you need it?</Text>
        <Text style={styles.subtitle}>
          Choose instant delivery or schedule for later
        </Text>
      </View>

      {serviceStartTime && serviceEndTime && (
        <View style={styles.serviceHours}>
          <Clock size={16} color={colors.primary} />
          <Text style={styles.serviceHoursText}>
            Service Hours: {serviceStartTime} - {serviceEndTime}
          </Text>
          <Badge variant={isServiceOpen ? "default" : "destructive"}>
            {isServiceOpen ? "Open" : "Closed"}
          </Badge>
        </View>
      )}

      <View style={styles.options}>
        {/* Order Now Option */}
        <TouchableOpacity
          onPress={() => isServiceOpen && dispatch(setBookingType("order_now"))}
          disabled={!isServiceOpen}
          activeOpacity={0.7}
        >
          <Card
            style={[
              styles.optionCard,
              bookingType === "order_now" && styles.optionCardSelected,
              !isServiceOpen && styles.optionCardDisabled,
            ]}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionLeft}>
                <Timer size={20} color={colors.primary} />
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Order Now</Text>
                  <Text style={styles.optionDescription}>
                    Get your beanbag delivered in ~5 minutes
                  </Text>
                  {!isServiceOpen && (
                    <Text style={styles.optionWarning}>
                      Currently outside service hours
                    </Text>
                  )}
                </View>
              </View>
              {isServiceOpen && <Badge>Fast</Badge>}
            </View>
          </Card>
        </TouchableOpacity>

        {/* Pre-Book Option */}
        <TouchableOpacity
          onPress={() => dispatch(setBookingType("pre_book"))}
          activeOpacity={0.7}
        >
          <Card
            style={[
              styles.optionCard,
              bookingType === "pre_book" && styles.optionCardSelected,
            ]}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionLeft}>
                <CalendarIcon size={20} color={colors.primary} />
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Pre-Book</Text>
                  <Text style={styles.optionDescription}>
                    Schedule your booking for a future date & time
                  </Text>
                </View>
              </View>
              <Badge variant="outline">Recommended</Badge>
            </View>
          </Card>
        </TouchableOpacity>
      </View>

      {/* Pre-Book Date/Time Selection */}
      {bookingType === "pre_book" && (
        <Card style={styles.preBookCard}>
          <View style={styles.preBookContent}>
            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeItem}>
                <Text style={styles.dateTimeLabel}>Select Date</Text>
                <DatePicker
                  value={scheduledDate}
                  onChange={(date) => handleDateChange(date)}
                  placeholder="Pick a date"
                  minimumDate={new Date()}
                />
              </View>

              <View style={styles.dateTimeItem}>
                <Text style={styles.dateTimeLabel}>Select Time</Text>
                <View style={styles.timeSlots}>
                  {filteredTimeSlots.length === 0 ? (
                    <Text style={styles.noSlotsText}>
                      {scheduledDate && isToday(scheduledDate)
                        ? "No more available time slots for today"
                        : "Please select a date first"}
                    </Text>
                  ) : (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      {filteredTimeSlots.map((time) => (
                        <TouchableOpacity
                          key={time}
                          onPress={() => dispatch(setScheduledTime(time))}
                          style={[
                            styles.timeSlot,
                            scheduledTime === time && styles.timeSlotSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.timeSlotText,
                              scheduledTime === time &&
                                styles.timeSlotTextSelected,
                            ]}
                          >
                            {time}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>
            </View>

            {scheduledDate && scheduledTime && (
              <View style={styles.scheduledInfo}>
                <CalendarIcon size={16} color={colors.primary} />
                <Text style={styles.scheduledText}>
                  Scheduled for{" "}
                  {format(
                    scheduledDate instanceof Date
                      ? scheduledDate
                      : new Date(scheduledDate),
                    "EEEE, MMMM d"
                  )}{" "}
                  at {scheduledTime}
                </Text>
              </View>
            )}

            <View style={styles.warningInfo}>
              <AlertCircle size={16} color={colors.warning} />
              <Text style={styles.warningText}>
                Please arrive within 15 minutes of your scheduled time for
                delivery.
              </Text>
            </View>
          </View>
        </Card>
      )}

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

function BookingTypeStepSkeleton() {
  return (
    <View style={styles.container}>
      <Skeleton width="100%" height={60} style={styles.skeleton} />
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
  serviceHours: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.muted + "80",
    borderRadius: borderRadius.medium,
    marginBottom: spacing.md,
  },
  serviceHoursText: {
    flex: 1,
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
    opacity: 0.6,
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
  optionDescription: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  optionWarning: {
    fontSize: fontSizes.xs,
    color: colors.warning,
    marginTop: spacing.xs,
  },
  preBookCard: {
    marginBottom: spacing.md,
  },
  preBookContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  dateTimeRow: {
    gap: spacing.md,
  },
  dateTimeItem: {
    gap: spacing.xs,
  },
  dateTimeLabel: {
    fontSize: fontSizes.base,
    fontWeight: "500",
    color: colors.text,
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.medium,
  },
  dateTimeButtonText: {
    fontSize: fontSizes.sm,
    color: colors.text,
  },
  timeSlots: {
    minHeight: 50,
  },
  noSlotsText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    padding: spacing.md,
  },
  timeSlot: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.medium,
  },
  timeSlotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeSlotText: {
    fontSize: fontSizes.sm,
    color: colors.text,
  },
  timeSlotTextSelected: {
    color: colors.textWhite,
    fontWeight: "600",
  },
  scheduledInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primary + "10",
    borderRadius: borderRadius.medium,
  },
  scheduledText: {
    fontSize: fontSizes.sm,
    fontWeight: "500",
    color: colors.primary,
  },
  warningInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.warning + "10",
    borderRadius: borderRadius.medium,
  },
  warningText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.warning,
  },
  continueButton: {
    marginTop: spacing.md,
  },
  skeleton: {
    marginBottom: spacing.md,
  },
});

export default BookingTypeStep;
