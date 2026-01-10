/**
 * Tab Switcher Component
 * Reusable tab switcher for Active/Upcoming bookings
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Clock, Calendar } from "lucide-react-native";
import { colors, fontSizes, spacing, borderRadius, shadows } from "../theme";

const TabSwitcher = ({
  activeTab,
  onTabChange,
  activeCount = 0,
  upcomingCount = 0,
}) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "active" && styles.tabActive]}
        onPress={() => onTabChange("active")}
        activeOpacity={0.7}
      >
        <Clock
          size={18}
          color={
            activeTab === "active"
              ? colors.primary
              : colors.mutedForeground
          }
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "active" && styles.tabTextActive,
          ]}
        >
          Active
        </Text>
        {activeCount > 0 && (
          <View
            style={[
              styles.tabBadge,
              activeTab === "active" && styles.tabBadgeActive,
            ]}
          >
            <Text
              style={[
                styles.tabBadgeText,
                activeTab === "active" && styles.tabBadgeTextActive,
              ]}
            >
              {activeCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === "upcoming" && styles.tabActive]}
        onPress={() => onTabChange("upcoming")}
        activeOpacity={0.7}
      >
        <Calendar
          size={18}
          color={
            activeTab === "upcoming"
              ? colors.primary
              : colors.mutedForeground
          }
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "upcoming" && styles.tabTextActive,
          ]}
        >
          Upcoming
        </Text>
        {upcomingCount > 0 && (
          <View
            style={[
              styles.tabBadge,
              activeTab === "upcoming" && styles.tabBadgeActive,
            ]}
          >
            <Text
              style={[
                styles.tabBadgeText,
                activeTab === "upcoming" && styles.tabBadgeTextActive,
              ]}
            >
              {upcomingCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.muted + "40",
    borderRadius: borderRadius.medium,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.small,
    backgroundColor: "transparent",
  },
  tabActive: {
    backgroundColor: colors.background,
    ...shadows.small,
  },
  tabText: {
    fontSize: fontSizes.body,
    fontWeight: "500",
    color: colors.mutedForeground,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },
  tabBadgeActive: {
    backgroundColor: colors.primary,
  },
  tabBadgeText: {
    fontSize: fontSizes.xs,
    fontWeight: "600",
    color: colors.mutedForeground,
  },
  tabBadgeTextActive: {
    color: colors.textWhite,
  },
});

export default TabSwitcher;

