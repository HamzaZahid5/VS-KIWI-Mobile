/**
 * Preferences Screen
 * User preferences matching web app
 * Reference: client/src/pages/User/preferences.tsx
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { ChevronLeft, Mail, MessageSquare, Save } from "lucide-react-native";
import { colors, spacing, fontSizes, borderRadius } from "../theme";
import { selectUser, setUser } from "../redux/authSlice";
import { get, patch } from "../utils/api";
import { AUTH_ENDPOINTS } from "../utils/constants";
import Card from "../components/Card";
import Button from "../components/Button";
import Skeleton from "../components/Skeleton";

const PreferencesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);
  const [user, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [preferredOtpChannel, setPreferredOtpChannel] = useState("email");
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      setPreferredOtpChannel(user.preferredOtpChannel || "email");
      setStayLoggedIn(user.stayLoggedIn ?? false);
    } else if (currentUser) {
      setPreferredOtpChannel(currentUser.preferredOtpChannel || "email");
      setStayLoggedIn(currentUser.stayLoggedIn ?? false);
    }
  }, [user, currentUser]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await get(AUTH_ENDPOINTS.user);
      const userData = response?.data || response;
      setUserData(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Use current user from Redux if API fails
      if (currentUser) {
        setUserData(currentUser);
      } else {
        Alert.alert("Error", "Failed to load user preferences.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const userToUpdate = user || currentUser;
    
    if (!userToUpdate?.id) {
      Alert.alert("Error", "User information not available.");
      return;
    }

    try {
      setIsSaving(true);
      const response = await patch(AUTH_ENDPOINTS.user, {
        preferredOtpChannel,
        stayLoggedIn,
      });

      const updatedUserData = response?.data || response;
      
      // Update Redux store with new user data
      const updatedUser = {
        ...(userToUpdate || {}),
        ...updatedUserData,
        preferredOtpChannel,
        stayLoggedIn,
      };
      
      dispatch(setUser(updatedUser));

      Alert.alert(
        "Preferences Updated",
        "Your preferences have been saved successfully."
      );

      // Go back to profile
      const parent = navigation.getParent();
      if (parent) {
        parent.navigate("MainTabs", { screen: "ProfileTab" });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      Alert.alert(
        "Failed to Save",
        error?.message || "An error occurred while saving your preferences. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate("MainTabs", { screen: "ProfileTab" });
    } else {
      navigation.goBack();
    }
  };

  const userToDisplay = user || currentUser;

  const hasChanges =
    preferredOtpChannel !== (userToDisplay?.preferredOtpChannel || "email") ||
    stayLoggedIn !== (userToDisplay?.stayLoggedIn ?? false);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.skeletonContainer}>
          <Skeleton style={styles.skeleton} />
          <Skeleton style={styles.skeleton} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleCancel}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Preferences</Text>
          <Text style={styles.headerSubtitle}>
            Manage your account preferences and settings
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* OTP Channel Preference */}
        <Card style={styles.preferenceCard}>
          <View style={styles.preferenceSection}>
            <View style={styles.preferenceHeader}>
              <Text style={styles.preferenceTitle}>Preferred OTP Channel</Text>
              <Text style={styles.preferenceDescription}>
                Choose how you want to receive verification codes
              </Text>
            </View>

            <View style={styles.radioGroup}>
              {/* Email Option */}
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setPreferredOtpChannel("email")}
                activeOpacity={0.7}
              >
                <View style={styles.radioButton}>
                  <View
                    style={[
                      styles.radioCircle,
                      preferredOtpChannel === "email" &&
                        styles.radioCircleSelected,
                    ]}
                  >
                    {preferredOtpChannel === "email" && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </View>
                <View style={styles.radioContent}>
                  <View style={styles.radioLabelRow}>
                    <Mail size={16} color={colors.foreground} />
                    <Text style={styles.radioLabel}>Email</Text>
                  </View>
                  {userToDisplay?.email && (
                    <Text style={styles.radioSubtext}>
                      {userToDisplay.email}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              {/* SMS Option */}
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setPreferredOtpChannel("sms")}
                activeOpacity={0.7}
              >
                <View style={styles.radioButton}>
                  <View
                    style={[
                      styles.radioCircle,
                      preferredOtpChannel === "sms" &&
                        styles.radioCircleSelected,
                    ]}
                  >
                    {preferredOtpChannel === "sms" && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </View>
                <View style={styles.radioContent}>
                  <View style={styles.radioLabelRow}>
                    <MessageSquare size={16} color={colors.foreground} />
                    <Text style={styles.radioLabel}>SMS</Text>
                  </View>
                  {userToDisplay?.phone && (
                    <Text style={styles.radioSubtext}>
                      {userToDisplay.phone}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={handleCancel}
            style={styles.cancelButton}
          />
          <Button
            title={isSaving ? "Saving..." : "Save Changes"}
            onPress={handleSave}
            disabled={!hasChanges || isSaving}
            loading={isSaving}
            icon={!isSaving && <Save size={16} color={colors.primaryForeground} />}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skeletonContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  skeleton: {
    height: 200,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: fontSizes.h1,
    fontWeight: "700",
    color: colors.foreground,
    marginBottom: spacing.xs / 2,
  },
  headerSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.mutedForeground,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  preferenceCard: {
    marginBottom: spacing.lg,
  },
  preferenceSection: {
    padding: spacing.md,
  },
  preferenceHeader: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  preferenceTitle: {
    fontSize: fontSizes.h3,
    fontWeight: "600",
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  preferenceDescription: {
    fontSize: fontSizes.body,
    color: colors.mutedForeground,
  },
  radioGroup: {
    gap: spacing.md,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  radioButton: {
    marginRight: spacing.md,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  radioContent: {
    flex: 1,
  },
  radioLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs / 2,
  },
  radioLabel: {
    fontSize: fontSizes.body,
    fontWeight: "500",
    color: colors.foreground,
  },
  radioSubtext: {
    fontSize: fontSizes.sm,
    color: colors.mutedForeground,
    marginLeft: spacing.lg + spacing.sm,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});

export default PreferencesScreen;

