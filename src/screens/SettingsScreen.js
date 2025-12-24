/**
 * Settings Screen
 * App settings and preferences
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { colors, fontSizes, spacing, borderRadius, shadows } from '../theme';
import { clearAllBookings } from '../redux/bookingSlice';

const SettingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // Handle clearing all bookings
  const handleClearAllBookings = () => {
    Alert.alert(
      'Clear All Bookings',
      'Are you sure you want to delete all bookings? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            dispatch(clearAllBookings());
            Alert.alert('Success', 'All bookings have been cleared.');
          },
        },
      ]
    );
  };

  // Handle app info
  const handleAppInfo = () => {
    Alert.alert(
      'Kiwi Rentals',
      'Version 1.0.0\n\nYour trusted partner for quality rentals.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications about your bookings
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={notificationsEnabled ? colors.primary : colors.textLight}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>
                Switch to dark theme
              </Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={darkModeEnabled ? colors.primary : colors.textLight}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Edit Profile</Text>
            <Text style={styles.settingButtonArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Change Password</Text>
            <Text style={styles.settingButtonArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Payment Methods</Text>
            <Text style={styles.settingButtonArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity
            style={[styles.settingButton, styles.dangerButton]}
            onPress={handleClearAllBookings}
          >
            <Text style={[styles.settingButtonText, styles.dangerText]}>
              Clear All Bookings
            </Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity
            style={styles.settingButton}
            onPress={handleAppInfo}
          >
            <Text style={styles.settingButtonText}>App Version</Text>
            <Text style={styles.settingButtonValue}>1.0.0</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Terms of Service</Text>
            <Text style={styles.settingButtonArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Privacy Policy</Text>
            <Text style={styles.settingButtonArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.navButtonText}>Back to Home</Text>
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
  section: {
    marginBottom: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    ...shadows.small,
  },
  sectionTitle: {
    fontSize: fontSizes.h3,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: fontSizes.body,
    fontWeight: '500',
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: fontSizes.bodySmall,
    color: colors.textLight,
  },
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingButtonText: {
    fontSize: fontSizes.body,
    color: colors.textDark,
  },
  settingButtonValue: {
    fontSize: fontSizes.body,
    color: colors.textLight,
  },
  settingButtonArrow: {
    fontSize: fontSizes.h2,
    color: colors.textLight,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  dangerButton: {
    paddingVertical: spacing.md,
  },
  dangerText: {
    color: colors.error,
  },
  navButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
  },
  navButtonText: {
    color: colors.textWhite,
    fontSize: fontSizes.button,
    fontWeight: '600',
  },
});

export default SettingsScreen;

