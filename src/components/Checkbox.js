/**
 * Checkbox Component
 * Reusable checkbox component matching web app styling
 */

import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
} from 'react-native';
import { colors, spacing, borderRadius } from '../theme';
import { Ionicons } from '@expo/vector-icons';

const Checkbox = ({
  checked = false,
  onPress,
  label,
  labelStyle,
  style,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
      {...props}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && (
          <Ionicons name="checkmark" size={16} color={colors.primaryForeground} />
        )}
      </View>
      {label && (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.small,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontSize: 14,
    color: colors.foreground,
  },
});

export default Checkbox;

