/**
 * Button Component
 * Reusable button component matching web app styling
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { colors, fontSizes, spacing, borderRadius, shadows } from '../theme';

const Button = ({
  title,
  onPress,
  variant = 'default',
  size = 'lg',
  disabled = false,
  loading = false,
  icon: Icon,
  style,
  textStyle,
  ...props
}) => {
  const buttonStyle = [
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    disabled && styles.buttonDisabled,
    style,
  ];

  const buttonTextStyle = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={variant === 'outline' ? colors.primary : colors.primaryForeground}
          />
          <Text style={[buttonTextStyle, { marginLeft: spacing.sm }]}>
            {title}
          </Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {Icon && (
            <View style={styles.icon}>
              {typeof Icon === 'function' ? <Icon /> : Icon}
            </View>
          )}
          <Text style={buttonTextStyle}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  button_default: {
    backgroundColor: colors.primary,
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  button_ghost: {
    backgroundColor: 'transparent',
  },
  button_destructive: {
    backgroundColor: colors.destructive,
  },
  button_lg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
  },
  button_md: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  button_sm: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minHeight: 32,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  text_default: {
    color: colors.primaryForeground,
  },
  text_outline: {
    color: colors.foreground,
  },
  text_ghost: {
    color: colors.primary,
  },
  text_destructive: {
    color: colors.destructiveForeground,
  },
  text_lg: {
    fontSize: fontSizes.button,
  },
  text_md: {
    fontSize: fontSizes.body,
  },
  text_sm: {
    fontSize: fontSizes.bodySmall,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.xs,
  },
});

export default Button;

