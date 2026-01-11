/**
 * Phone Input Component
 * Phone number input with country code selection matching web app
 */

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, fontSizes, borderRadius } from "../theme";

// Common countries with their codes and flags
const COUNTRIES = [
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪" },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦" },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  { code: "PK", name: "Pakistan", dialCode: "+92", flag: "🇵🇰" },
  { code: "EG", name: "Egypt", dialCode: "+20", flag: "🇪🇬" },
  { code: "JO", name: "Jordan", dialCode: "+962", flag: "🇯🇴" },
  { code: "KW", name: "Kuwait", dialCode: "+965", flag: "🇰🇼" },
  { code: "QA", name: "Qatar", dialCode: "+974", flag: "🇶🇦" },
  { code: "BH", name: "Bahrain", dialCode: "+973", flag: "🇧🇭" },
  { code: "OM", name: "Oman", dialCode: "+968", flag: "🇴🇲" },
];

const PhoneInput = ({
  value = "",
  onChangeText,
  placeholder = "Enter your phone number",
  defaultCountry = "AE",
  error,
  label,
  style,
  ...props
}) => {
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRIES.find((c) => c.code === defaultCountry) || COUNTRIES[0]
  );
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(
    value.replace(selectedCountry.dialCode, "").trim()
  );

  const handlePhoneChange = (text) => {
    // Remove non-numeric characters except spaces and dashes
    const cleaned = text.replace(/[^\d\s-]/g, "");
    setPhoneNumber(cleaned);
    const fullNumber = `${selectedCountry.dialCode}${cleaned}`;
    if (onChangeText) {
      onChangeText(fullNumber);
    }
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    // Update the full number with new country code
    const fullNumber = `${country.dialCode}${phoneNumber}`;
    if (onChangeText) {
      onChangeText(fullNumber);
    }
  };

  React.useEffect(() => {
    if (value) {
      // Extract country code and phone number from value
      const country = COUNTRIES.find((c) => value.startsWith(c.dialCode));
      if (country) {
        setSelectedCountry(country);
        setPhoneNumber(value.replace(country.dialCode, "").trim());
      } else {
        setPhoneNumber(value);
      }
    }
  }, [value]);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[styles.inputContainer, error && styles.inputContainerError]}
      >
        <TouchableOpacity
          style={styles.countryButton}
          onPress={() => setShowCountryPicker(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.flag}>{selectedCountry.flag}</Text>
          <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={colors.mutedForeground}
          />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={handlePhoneChange}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          keyboardType="phone-pad"
          {...props}
          maxLength={15}
        />
        {/* <Ionicons
          name="call-outline"
          size={20}
          color={colors.mutedForeground}
          style={styles.icon}
        /> */}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity
                onPress={() => setShowCountryPicker(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    selectedCountry.code === item.code &&
                      styles.countryItemSelected,
                  ]}
                  onPress={() => handleCountrySelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.countryFlag}>{item.flag}</Text>
                  <View style={styles.countryInfo}>
                    <Text style={styles.countryName}>{item.name}</Text>
                    <Text style={styles.countryDialCode}>{item.dialCode}</Text>
                  </View>
                  {selectedCountry.code === item.code && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSizes.bodySmall,
    fontWeight: "500",
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    minHeight: 48,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  countryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: spacing.sm,
    marginRight: spacing.xs,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    gap: spacing.xs,
  },
  flag: {
    fontSize: 20,
  },
  dialCode: {
    fontSize: fontSizes.body,
    color: colors.foreground,
    fontWeight: "500",
  },
  input: {
    flex: 1,
    fontSize: fontSizes.body,
    color: colors.foreground,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  icon: {
    marginLeft: spacing.xs,
  },
  errorText: {
    fontSize: fontSizes.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
    maxHeight: "80%",
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSizes.h3,
    fontWeight: "700",
    color: colors.foreground,
  },
  closeButton: {
    padding: spacing.xs,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  countryItemSelected: {
    backgroundColor: colors.primaryMuted,
  },
  countryFlag: {
    fontSize: 24,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: fontSizes.body,
    fontWeight: "500",
    color: colors.foreground,
    marginBottom: spacing.xs / 2,
  },
  countryDialCode: {
    fontSize: fontSizes.bodySmall,
    color: colors.mutedForeground,
  },
});

export default PhoneInput;
