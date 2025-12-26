/**
 * Date Picker Component
 * Simple date picker for React Native
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Calendar as CalendarIcon, X } from 'lucide-react-native';
import { format, addDays, startOfDay, isBefore, isToday } from 'date-fns';
import { colors, spacing, fontSizes, borderRadius } from '../theme';
import Button from './Button';

const DatePicker = ({
  value,
  onChange,
  minimumDate,
  maximumDate,
  placeholder = 'Pick a date',
  style,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Generate available dates (next 30 days)
  const availableDates = React.useMemo(() => {
    const dates = [];
    const start = minimumDate || new Date();
    const end = maximumDate || addDays(start, 30);
    
    let current = startOfDay(start);
    const endDate = startOfDay(end);
    
    while (current <= endDate) {
      if (!isBefore(current, startOfDay(new Date()))) {
        dates.push(new Date(current));
      }
      current = addDays(current, 1);
    }
    
    return dates;
  }, [minimumDate, maximumDate]);

  const handleSelectDate = (date) => {
    onChange(date);
    setIsVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={() => setIsVisible(true)}
        activeOpacity={0.7}
      >
        <CalendarIcon size={16} color={colors.primary} />
        <Text style={styles.buttonText}>
          {value ? format(value, 'PPP') : placeholder}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.datesList} showsVerticalScrollIndicator={false}>
              {availableDates.map((date, index) => {
                const isSelected = value && format(value, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                const isTodayDate = isToday(date);
                
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSelectDate(date)}
                    style={[
                      styles.dateItem,
                      isSelected && styles.dateItemSelected,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dateText,
                      isSelected && styles.dateTextSelected,
                    ]}>
                      {format(date, 'EEEE, MMMM d, yyyy')}
                    </Text>
                    {isTodayDate && (
                      <Text style={styles.todayLabel}>Today</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.medium,
  },
  buttonText: {
    fontSize: fontSizes.sm,
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  datesList: {
    maxHeight: 400,
  },
  dateItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateItemSelected: {
    backgroundColor: colors.primary + '10',
  },
  dateText: {
    fontSize: fontSizes.base,
    color: colors.text,
  },
  dateTextSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
  todayLabel: {
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontWeight: '500',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.sm,
  },
});

export default DatePicker;

