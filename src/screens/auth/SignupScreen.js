/**
 * Signup Screen
 * User signup screen matching web app exactly
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, fontSizes } from "../../theme";
import Button from "../../components/Button";
import Input from "../../components/Input";
import PhoneInput from "../../components/PhoneInput";
import Card from "../../components/Card";
import Divider from "../../components/Divider";
import { post } from "../../utils/api";
import { AUTH_ENDPOINTS } from "../../utils/constants";
import { setAuth } from "../../redux/authSlice";
import { storeAuthToken, storeData } from "../../utils/storage";
import { STORAGE_KEYS } from "../../utils/constants";
import { isValidEmail, isValidPhone } from "../../helpers/validationHelper";

const SignupScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!firstName || firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    } else if (firstName.length > 50) {
      newErrors.firstName = "First name must be less than 50 characters";
    }

    if (!lastName || lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    } else if (lastName.length > 50) {
      newErrors.lastName = "Last name must be less than 50 characters";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else if (!isValidPhone(phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!password || password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await post(AUTH_ENDPOINTS.signup, {
        email,
        phone,
        firstName,
        lastName,
        password,
      });
      console.log("Signup response:", response);

      // Signup API doesn't return token - user needs to verify email first
      // OTP is automatically sent during signup
      if (response.statusCode === 201 || response.message) {
        // Show success alert
        Alert.alert(
          "Account created",
          "Please verify your email to continue. A verification code has been sent to your email.",
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate to OTP verification screen with email
                // OTP was already sent during signup, so go directly to verification step
                navigation.navigate("OTPLogin", {
                  email: email,
                  fromSignup: true, // Flag to indicate this is from signup (OTP already sent)
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        "Sign up failed",
        error.message || "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    Alert.alert("Google Signup", "Google OAuth will be implemented");
  };

  const handleAppleSignup = () => {
    Alert.alert("Apple Signup", "Apple OAuth will be implemented");
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {navigation.canGoBack() ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={colors.foreground} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
        <Text style={styles.headerTitle}>Sign up</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card}>
          <Card.Header>
            <Card.Title>Create an account</Card.Title>
            <Card.Description>
              Sign up to get started with Kiwi Rentals
            </Card.Description>
          </Card.Header>

          <Card.Content>
            <Input
              label="First name"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                clearError("firstName");
              }}
              placeholder="Enter your first name"
              error={errors.firstName}
              icon={() => <Ionicons name="person-outline" />}
            />

            <Input
              label="Last name"
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                clearError("lastName");
              }}
              placeholder="Enter your last name"
              error={errors.lastName}
              icon={() => <Ionicons name="person-outline" />}
            />

            <Input
              label="Email address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearError("email");
              }}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              icon={() => <Ionicons name="mail-outline" />}
            />

            <PhoneInput
              label="Phone number"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                clearError("phone");
              }}
              placeholder="Enter your phone number"
              defaultCountry="AE"
              error={errors.phone}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearError("password");
              }}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              error={errors.password}
              icon={() => <Ionicons name="lock-closed-outline" />}
              rightIcon={() => (
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                />
              )}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <Input
              label="Confirm password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                clearError("confirmPassword");
              }}
              placeholder="Confirm your password"
              secureTextEntry={!showConfirmPassword}
              error={errors.confirmPassword}
              icon={() => <Ionicons name="lock-closed-outline" />}
              rightIcon={() => (
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                />
              )}
              onRightIconPress={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            />

            <Button
              title="Sign up"
              onPress={handleSignup}
              loading={loading}
              style={styles.signupButton}
            />

            <Divider text="or continue with" />

            <View style={styles.socialButtons}>
              <Button
                title="Google"
                variant="outline"
                onPress={handleGoogleSignup}
                style={styles.socialButton}
                icon={
                  <Ionicons
                    name="logo-google"
                    size={16}
                    color={colors.foreground}
                  />
                }
              />
              {Platform.OS === "ios" && (
                <Button
                  title="Apple"
                  variant="outline"
                  onPress={handleAppleSignup}
                  style={styles.socialButton}
                  icon={
                    <Ionicons
                      name="logo-apple"
                      size={16}
                      color={colors.foreground}
                    />
                  }
                />
              )}
            </View>

            <View style={styles.loginLink}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                activeOpacity={0.7}
              >
                <Text style={styles.loginLinkText}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSizes.h3,
    fontWeight: "700",
    color: colors.foreground,
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 36,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.md,
  },
  card: {
    width: "100%",
    alignSelf: "center",
  },
  signupButton: {
    marginTop: spacing.md,
  },
  socialButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  socialButton: {
    flex: 1,
  },
  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  loginText: {
    fontSize: fontSizes.bodySmall,
    color: colors.mutedForeground,
  },
  loginLinkText: {
    fontSize: fontSizes.bodySmall,
    color: colors.primary,
    fontWeight: "600",
  },
});

export default SignupScreen;
