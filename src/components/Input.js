/**
 * Input Component
 * Reusable input component matching web app styling
 */

import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../theme';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  icon: Icon,
  rightIcon: RightIcon,
  onRightIconPress,
  keyboardType = 'default',
  autoCapitalize = 'none',
  style,
  containerStyle,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputContainerError]}>
        {Icon && (
          <View style={styles.iconContainer}>
            <Icon size={16} color={colors.mutedForeground} />
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            Icon && styles.inputWithIcon,
            RightIcon && styles.inputWithRightIcon,
            style,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          {...props}
        />
        {RightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            activeOpacity={0.7}
          >
            <RightIcon size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSizes.bodySmall,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  iconContainer: {
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: fontSizes.body,
    color: colors.foreground,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  rightIconContainer: {
    paddingRight: spacing.md,
    paddingLeft: spacing.sm,
    justifyContent: 'center',
  },
  errorText: {
    fontSize: fontSizes.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

export default Input;

