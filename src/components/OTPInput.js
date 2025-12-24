/**
 * OTP Input Component
 * 6-digit OTP input matching web app styling
 */

import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, borderRadius, fontSizes } from '../theme';

const OTPInput = ({ value, onChange, maxLength = 6, style }) => {
  const inputRefs = useRef([]);
  const [focusedIndex, setFocusedIndex] = useState(null);

  const handleChange = (text, index) => {
    if (text.length > 1) {
      // Handle paste
      const pastedText = text.slice(0, maxLength);
      const newValue = value.split('');
      pastedText.split('').forEach((char, i) => {
        if (index + i < maxLength) {
          newValue[index + i] = char;
        }
      });
      onChange(newValue.join(''));
      // Focus last filled input
      const nextIndex = Math.min(index + pastedText.length, maxLength - 1);
      inputRefs.current[nextIndex]?.focus();
    } else {
      // Handle single character
      const newValue = value.split('');
      newValue[index] = text;
      onChange(newValue.join(''));
      
      // Move to next input
      if (text && index < maxLength - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: maxLength }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={[
            styles.input,
            focusedIndex === index && styles.inputFocused,
            value[index] && styles.inputFilled,
          ]}
          value={value[index] || ''}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  input: {
    width: 48,
    height: 56,
    borderRadius: borderRadius.medium,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.input,
    textAlign: 'center',
    fontSize: fontSizes.h2,
    fontWeight: '600',
    color: colors.foreground,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  inputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
});

export default OTPInput;

