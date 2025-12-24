/**
 * Card Component
 * Reusable card component matching web app styling
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors, borderRadius, shadows, spacing, fontSizes } from '../theme';

const Card = ({ children, style, ...props }) => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};

const CardHeader = ({ children, style, ...props }) => {
  return (
    <View style={[styles.header, style]} {...props}>
      {children}
    </View>
  );
};

const CardTitle = ({ children, style, ...props }) => {
  return (
    <Text style={[styles.title, style]} {...props}>
      {children}
    </Text>
  );
};

const CardDescription = ({ children, style, ...props }) => {
  return (
    <Text style={[styles.description, style]} {...props}>
      {children}
    </Text>
  );
};

const CardContent = ({ children, style, ...props }) => {
  return (
    <View style={[styles.content, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.large,
    ...shadows.medium,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSizes.h1,
    fontWeight: '700',
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSizes.bodySmall,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
});

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;

export default Card;

