/**
 * Badge Component
 * Reusable badge component matching web app styling
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../theme';
import { withOpacity } from '../utils/colorHelper';

const Badge = ({
  children,
  variant = 'secondary',
  style,
  textStyle,
  ...props
}) => {
  // Extract custom text color from textStyle if provided
  const customTextColor = textStyle?.color || null;
  const badgeStyle = [
    styles.badge,
    styles[`badge_${variant}`],
    style,
  ];

  const badgeTextStyle = [
    styles.text,
    styles[`text_${variant}`],
    customTextColor && { color: customTextColor },
    textStyle,
  ];

  return (
    <View style={badgeStyle} {...props}>
      <Text style={badgeTextStyle}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    alignSelf: 'flex-start',
  },
  badge_default: {
    backgroundColor: colors.primary,
  },
  badge_secondary: {
    backgroundColor: colors.muted,
  },
  badge_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge_warning: {
    backgroundColor: withOpacity(colors.warning, 0.2),
  },
  badge_destructive: {
    backgroundColor: withOpacity(colors.error, 0.2),
  },
  text: {
    fontSize: fontSizes.caption,
    fontWeight: '600',
  },
  text_default: {
    color: colors.primaryForeground,
  },
  text_secondary: {
    color: colors.mutedForeground,
  },
  text_outline: {
    color: colors.foreground,
  },
  text_warning: {
    color: colors.warning,
  },
  text_destructive: {
    color: colors.error,
  },
});

export default Badge;

