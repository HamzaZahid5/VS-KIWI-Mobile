/**
 * StatCard Component
 * Stat card component matching web app exactly
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Card from "./Card";
import { colors, fontSizes, spacing, borderRadius } from "../theme";
import { withOpacity } from "../utils/colorHelper";

const StatCard = ({
  title,
  value,
  icon: Icon,
  iconBgColor = withOpacity(colors.primary, 0.1),
  iconColor = colors.primary,
  style,
}) => {
  return (
    <Card style={[styles.card, style]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          {Icon && <Icon size={24} color={iconColor} />}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.round,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: fontSizes.caption,
    fontWeight: "500",
    color: colors.mutedForeground,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: fontSizes.h3,
    fontWeight: "700",
    color: colors.foreground,
  },
});

export default StatCard;
