/**
 * Profile Screen
 * Displays user profile information matching web app implementation
 * Reference: client/src/pages/User/profile.tsx
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import {
  UserIcon,
  Mail,
  Phone,
  CreditCard,
  History,
  HelpCircle,
  FileText,
  Shield,
  LogOut,
  ChevronRight,
  Settings,
  Edit,
} from 'lucide-react-native';
import { colors, fontSizes, spacing, borderRadius, shadows } from '../theme';
import { selectUser } from '../redux/authSlice';
import { logout } from '../redux/authSlice';
import { removeAuthToken, removeData } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import Card from '../components/Card';
import Button from '../components/Button';
import { withOpacity } from '../utils/colorHelper';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector(selectUser);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear auth token and user data from storage
              await removeAuthToken();
              await removeData(STORAGE_KEYS.USER_DATA);
              
              // Clear Redux state
              dispatch(logout());
              
              // Navigate to login
              // Note: Navigation will be handled by AppNavigator's auth state listener
            } catch (error) {
              console.error('Error during logout:', error);
              // Still dispatch logout even if storage clear fails
              dispatch(logout());
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile screen when implemented
    Alert.alert('Edit Profile', 'Edit profile functionality coming soon!');
  };

  const handleBookingHistory = () => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('BookingHistory');
    } else {
      navigation.navigate('BookingHistory');
    }
  };

  const handlePaymentMethods = () => {
    // TODO: Navigate to payment methods screen when implemented
    Alert.alert('Payment Methods', 'Payment methods functionality coming soon!');
  };

  const handlePreferences = () => {
    // Navigate to Settings screen (parent stack navigator)
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('Settings');
    } else {
      navigation.navigate('Settings');
    }
  };

  // Calculate user initials
  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  // Menu items matching web app
  const menuItems = [
    { 
      icon: History, 
      label: 'Booking History', 
      onPress: handleBookingHistory,
      testId: 'menu-item-booking-history'
    },
    { 
      icon: CreditCard, 
      label: 'Payment Methods', 
      onPress: handlePaymentMethods,
      testId: 'menu-item-payment-methods'
    },
    { 
      icon: Settings, 
      label: 'Preferences', 
      onPress: handlePreferences,
      testId: 'menu-item-preferences'
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              {user?.profileImageUrl ? (
                <Image
                  source={{ uri: user.profileImageUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}
            </View>
            <Text style={styles.userName}>
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : 'User'}
            </Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
              activeOpacity={0.7}
            >
              <Edit size={16} color={colors.primary} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Account Menu */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <UserIcon size={20} color={colors.foreground} />
            <Text style={styles.sectionTitle}>Account</Text>
          </View>
          <Card style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.menuItem,
                  index < menuItems.length - 1 && styles.menuItemBorder,
                ]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <item.icon size={20} color={colors.mutedForeground} />
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </View>
                <ChevronRight size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        {/* Logout Button */}
        <Button
          title="Log Out"
          onPress={handleLogout}
          variant="destructive"
          icon={<LogOut size={20} color={colors.textWhite} />}
          style={styles.logoutButton}
        />

        {/* Version Info */}
        <Text style={styles.versionText}>Kiwi v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSizes.h1,
    fontWeight: '700',
    color: colors.foreground,
  },
  profileCard: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  profileContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarText: {
    fontSize: fontSizes.h1,
    fontWeight: '700',
    color: colors.primaryForeground,
  },
  userName: {
    fontSize: fontSizes.h2,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: fontSizes.body,
    color: colors.mutedForeground,
    marginBottom: spacing.md,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  editButtonText: {
    fontSize: fontSizes.bodySmall,
    fontWeight: '500',
    color: colors.primary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.h3,
    fontWeight: '600',
    color: colors.foreground,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  menuItemText: {
    fontSize: fontSizes.body,
    color: colors.foreground,
  },
  logoutButton: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  versionText: {
    textAlign: 'center',
    fontSize: fontSizes.bodySmall,
    color: colors.mutedForeground,
    marginTop: spacing.md,
  },
});

export default ProfileScreen;
