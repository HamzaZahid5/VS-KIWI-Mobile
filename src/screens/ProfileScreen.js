/**
 * Profile Screen
 * Displays user profile information and account details
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

const ProfileScreen = ({ navigation }) => {
  const bookings = useSelector(selectAllBookings);

  // Profile data (in a real app, this would come from Redux or API)
  const profileData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    memberSince: '2023',
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profileData.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.profileName}>{profileData.name}</Text>
          <Text style={styles.profileEmail}>{profileData.email}</Text>
        </View>

        {/* Profile Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{bookings.length}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profileData.memberSince}</Text>
            <Text style={styles.statLabel}>Member Since</Text>
          </View>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{profileData.name}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profileData.email}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{profileData.phone}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Booking')}
          >
            <Text style={styles.actionButtonText}>View My Bookings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.actionButtonText}>Settings</Text>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
  },
  avatarText: {
    fontSize: fontSizes.displaySmall,
    fontWeight: '700',
    color: colors.textWhite,
  },
  profileName: {
    fontSize: fontSizes.h1,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  profileEmail: {
    fontSize: fontSizes.body,
    color: colors.textLight,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSizes.h1,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSizes.bodySmall,
    color: colors.textLight,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.h3,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    ...shadows.small,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: fontSizes.body,
    color: colors.textLight,
  },
  infoValue: {
    fontSize: fontSizes.body,
    color: colors.textDark,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  actionButton: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  actionButtonText: {
    fontSize: fontSizes.body,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ProfileScreen;

