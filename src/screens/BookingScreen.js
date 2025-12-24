/**
 * Booking Screen
 * Displays and manages user bookings
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { colors, fontSizes, spacing, borderRadius, shadows } from '../theme';
import {
  selectAllBookings,
  removeBooking,
  addBooking,
} from '../redux/bookingSlice';
import { formatDate } from '../helpers/dateHelper';

const BookingScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const bookings = useSelector(selectAllBookings);
  const [refreshing, setRefreshing] = useState(false);

  // Handle booking deletion
  const handleDeleteBooking = (bookingId) => {
    Alert.alert(
      'Delete Booking',
      'Are you sure you want to delete this booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(removeBooking(bookingId)),
        },
      ]
    );
  };

  // Handle adding a test booking
  const handleAddTestBooking = () => {
    const newBooking = {
      id: Date.now().toString(),
      propertyName: 'Sample Property',
      location: 'Sample Location',
      checkIn: new Date().toISOString(),
      checkOut: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      guests: 2,
      price: 150,
    };
    dispatch(addBooking(newBooking));
  };

  // Render booking item
  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingTitle}>{item.propertyName || 'Property'}</Text>
        <TouchableOpacity
          onPress={() => handleDeleteBooking(item.id)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.bookingLocation}>{item.location || 'Location'}</Text>
      <View style={styles.bookingDetails}>
        <View style={styles.bookingDetailRow}>
          <Text style={styles.bookingDetailLabel}>Check-in:</Text>
          <Text style={styles.bookingDetailValue}>
            {item.checkIn ? formatDate(item.checkIn) : 'N/A'}
          </Text>
        </View>
        <View style={styles.bookingDetailRow}>
          <Text style={styles.bookingDetailLabel}>Check-out:</Text>
          <Text style={styles.bookingDetailValue}>
            {item.checkOut ? formatDate(item.checkOut) : 'N/A'}
          </Text>
        </View>
        {item.guests && (
          <View style={styles.bookingDetailRow}>
            <Text style={styles.bookingDetailLabel}>Guests:</Text>
            <Text style={styles.bookingDetailValue}>{item.guests}</Text>
          </View>
        )}
        {item.price && (
          <View style={styles.bookingDetailRow}>
            <Text style={styles.bookingDetailLabel}>Price:</Text>
            <Text style={styles.bookingDetailValue}>${item.price}/night</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Bookings Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start by adding your first booking
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddTestBooking}
          >
            <Text style={styles.addButtonText}>Add Test Booking</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={bookings}
            renderItem={renderBookingItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={() => setRefreshing(false)}
          />
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddTestBooking}
            >
              <Text style={styles.addButtonText}>Add New Booking</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  bookingCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.large,
    ...shadows.small,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bookingTitle: {
    fontSize: fontSizes.h3,
    fontWeight: '600',
    color: colors.textDark,
    flex: 1,
  },
  deleteButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: fontSizes.bodySmall,
    fontWeight: '500',
  },
  bookingLocation: {
    fontSize: fontSizes.body,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  bookingDetails: {
    gap: spacing.xs,
  },
  bookingDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bookingDetailLabel: {
    fontSize: fontSizes.bodySmall,
    color: colors.textLight,
  },
  bookingDetailValue: {
    fontSize: fontSizes.bodySmall,
    color: colors.textDark,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSizes.h2,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSizes.body,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.textWhite,
    fontSize: fontSizes.button,
    fontWeight: '600',
  },
});

export default BookingScreen;

