/**
 * EmptyState Component
 * Empty state component matching web app exactly
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from './Button';
import { colors, fontSizes, spacing, borderRadius } from '../theme';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  buttonText,
  onButtonPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        {Icon && <Icon size={40} color={colors.mutedForeground} />}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {buttonText && onButtonPress && (
        <Button
          title={buttonText}
          onPress={onButtonPress}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.round,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.h3,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: fontSizes.body,
    color: colors.mutedForeground,
    marginBottom: spacing.lg,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  button: {
    marginTop: spacing.sm,
  },
});

export default EmptyState;

