/**
 * Home Screen
 * Main landing screen of the app
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { colors, fontSizes, spacing, borderRadius, shadows } from '../theme';
import { selectAllBookings } from '../redux/bookingSlice';

const HomeScreen = ({ navigation }) => {
  // Get bookings from Redux store
  const bookings = useSelector(selectAllBookings);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to Kiwi Rentals</Text>
          <Text style={styles.welcomeSubtitle}>
            Your trusted partner for quality rentals
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{bookings.length}</Text>
            <Text style={styles.statLabel}>Active Bookings</Text>
          </View>
        </View>

        {/* Navigation Cards */}
        <View style={styles.navigationSection}>
          <TouchableOpacity
            style={styles.navCard}
            onPress={() => navigation.navigate('Booking')}
            activeOpacity={0.7}
          >
            <Text style={styles.navCardTitle}>My Bookings</Text>
            <Text style={styles.navCardSubtitle}>
              View and manage your bookings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navCard}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <Text style={styles.navCardTitle}>Profile</Text>
            <Text style={styles.navCardSubtitle}>
              Manage your account settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navCard}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <Text style={styles.navCardTitle}>Settings</Text>
            <Text style={styles.navCardSubtitle}>
              App preferences and more
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  scrollContent: {
    padding: spacing.md,
  },
  welcomeSection: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.large,
    ...shadows.medium,
  },
  welcomeTitle: {
    fontSize: fontSizes.h1,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: fontSizes.body,
    color: colors.textLight,
  },
  statsContainer: {
    marginBottom: spacing.lg,
  },
  statCard: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.large,
    alignItems: 'center',
    ...shadows.medium,
  },
  statNumber: {
    fontSize: fontSizes.display,
    fontWeight: '700',
    color: colors.textWhite,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSizes.body,
    color: colors.textWhite,
    opacity: 0.9,
  },
  navigationSection: {
    gap: spacing.md,
  },
  navCard: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: borderRadius.large,
    ...shadows.small,
  },
  navCardTitle: {
    fontSize: fontSizes.h3,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  navCardSubtitle: {
    fontSize: fontSizes.bodySmall,
    color: colors.textLight,
  },
});

export default HomeScreen;

