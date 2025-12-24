/**
 * Progress Component
 * Progress bar component matching web app styling
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../theme';

const Progress = ({ value = 0, style, barStyle, ...props }) => {
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <View style={[styles.container, style]} {...props}>
      <View style={[styles.bar, { width: `${percentage}%` }, barStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8,
    backgroundColor: colors.muted,
    borderRadius: borderRadius.round,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.round,
  },
});

export default Progress;

