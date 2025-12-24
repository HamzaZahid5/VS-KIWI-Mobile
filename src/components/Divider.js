/**
 * Divider Component
 * Divider with text in the middle matching web app styling
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes } from '../theme';

const Divider = ({ text, style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.line} />
      {text && (
        <Text style={styles.text}>{text.toUpperCase()}</Text>
      )}
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  text: {
    paddingHorizontal: spacing.sm,
    fontSize: fontSizes.caption,
    color: colors.mutedForeground,
    fontWeight: '500',
  },
});

export default Divider;

