/**
 * Edit Profile Screen
 * User profile editing matching web app
 * Reference: client/src/pages/User/edit-profile.tsx
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
  ChevronLeft,
  Mail,
  UserIcon,
  Save,
  Phone,
  CheckCircle,
} from "lucide-react-native";
import { colors, spacing, fontSizes, borderRadius } from "../theme";
import { selectUser, setUser } from "../redux/authSlice";
import { get, patch, post } from "../utils/api";
import { AUTH_ENDPOINTS, OTP_ENDPOINTS } from "../utils/constants";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import PhoneInput from "../components/PhoneInput";
import Skeleton from "../components/Skeleton";
import OTPInput from "../components/OTPInput";
import { isValidPhone } from "../helpers/validationHelper";

const EditProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);
  const [user, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Phone verification modal
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [verificationStep, setVerificationStep] = useState("send"); // "send" | "verify" | "success"
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Form validation
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setPhone(normalizePhoneNumber(user.phone || "") || "");
    } else if (currentUser) {
      setFirstName(currentUser.firstName || "");
      setLastName(currentUser.lastName || "");
      setEmail(currentUser.email || "");
      setPhone(normalizePhoneNumber(currentUser.phone || "") || "");
    }
  }, [user, currentUser]);

  const normalizePhoneNumber = (phone) => {
    if (!phone || phone.trim() === "") return "";
    if (phone.startsWith("+")) return phone;
    return phone;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!firstName.trim() || firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    } else if (firstName.trim().length > 50) {
      newErrors.firstName = "First name must be less than 50 characters";
    }

    if (!lastName.trim() || lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    } else if (lastName.trim().length > 50) {
      newErrors.lastName = "Last name must be less than 50 characters";
    }

    if (!email.trim() || !email.includes("@")) {
      newErrors.email = "Please enter a valid email address";
    }

    if (phone && phone.trim() && !isValidPhone(phone.trim())) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await get(AUTH_ENDPOINTS.user);
      const userData = response?.data || response;
      setUserData(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (currentUser) {
        setUserData(currentUser);
      } else {
        Alert.alert("Error", "Failed to load user profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      Alert.alert("Phone Number Required", "Please enter a phone number.");
      return;
    }

    try {
      setSendingOtp(true);
      await post(OTP_ENDPOINTS.send, {
        contact: phone.trim(),
        channel: "sms",
      });

      setVerificationStep("verify");
      Alert.alert(
        "Verification Code Sent",
        "Check your phone for the OTP code."
      );
    } catch (error) {
      console.error("Error sending OTP:", error);
      Alert.alert("Failed to Send Code", error?.message || "Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid Code", "Please enter the 6-digit code.");
      return;
    }

    try {
      setVerifyingOtp(true);
      await post(OTP_ENDPOINTS.verify, {
        contact: phone.trim(),
        otp: otp,
        channel: "sms",
      });

      setVerificationStep("success");
      Alert.alert(
        "Phone Verified",
        "Your phone number has been verified successfully."
      );
    } catch (error) {
      console.error("Error verifying OTP:", error);
      Alert.alert(
        "Verification Failed",
        error?.message || "Invalid or expired code. Please try again."
      );
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setSendingOtp(true);
      await post(OTP_ENDPOINTS.send, {
        contact: phone.trim(),
        channel: "sms",
      });

      setOtp("");
      Alert.alert(
        "Verification Code Resent",
        "Check your phone for the new OTP code."
      );
    } catch (error) {
      console.error("Error resending OTP:", error);
      Alert.alert(
        "Failed to Resend Code",
        error?.message || "Please try again."
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOpenVerificationModal = () => {
    setShowVerificationModal(true);
    setVerificationStep("send");
    setOtp("");
  };

  const handleCloseVerificationModal = () => {
    setShowVerificationModal(false);
    setOtp("");
    setVerificationStep("send");
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const userToUpdate = user || currentUser;

    if (!userToUpdate?.id) {
      Alert.alert("Error", "User information not available.");
      return;
    }

    try {
      setIsSaving(true);
      const response = await patch(AUTH_ENDPOINTS.user, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        // Note: Email is not sent as it's disabled/read-only
      });

      const updatedUserData = response?.data || response;

      // Update Redux store with new user data
      const updatedUser = {
        ...(userToUpdate || {}),
        ...updatedUserData,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      };

      dispatch(setUser(updatedUser));

      Alert.alert(
        "Profile Updated",
        "Your profile has been updated successfully."
      );

      // Navigate back to profile
      const parent = navigation.getParent();
      if (parent) {
        parent.navigate("MainTabs", { screen: "ProfileTab" });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert(
        "Failed to Update",
        error?.message ||
          "An error occurred while updating your profile. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate("MainTabs", { screen: "ProfileTab" });
    } else {
      navigation.goBack();
    }
  };
  const renderLoading = () => {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.skeletonContainer}>
          <Skeleton style={styles.skeleton} />
          <Skeleton style={styles.skeleton} />
        </View>
      </SafeAreaView>
    );
  };

  const userToDisplay = user || currentUser;
  const hasChanges =
    firstName.trim() !== (userToDisplay?.firstName || "") ||
    lastName.trim() !== (userToDisplay?.lastName || "") ||
    phone.trim() !== normalizePhoneNumber(userToDisplay?.phone || "");

  if (false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.skeletonContainer}>
          <Skeleton style={styles.skeleton} />
          <Skeleton style={styles.skeleton} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleCancel}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <Text style={styles.headerSubtitle}>
            Update your personal information
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
      {loading ? (
        renderLoading()
      ) : (
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
          {/* Profile Form */}
          <Card style={styles.formCard}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <Text style={styles.sectionDescription}>
                Update your profile details below
              </Text>

              <View style={styles.formFields}>
                {/* First Name */}
                <Input
                  label="First name"
                  value={firstName}
                  onChangeText={(text) => {
                    setFirstName(text);
                    if (errors.firstName) {
                      setErrors({ ...errors, firstName: null });
                    }
                  }}
                  placeholder="Enter your first name"
                  icon={UserIcon}
                  error={errors.firstName}
                />

                {/* Last Name */}
                <Input
                  label="Last name"
                  value={lastName}
                  onChangeText={(text) => {
                    setLastName(text);
                    if (errors.lastName) {
                      setErrors({ ...errors, lastName: null });
                    }
                  }}
                  placeholder="Enter your last name"
                  icon={UserIcon}
                  error={errors.lastName}
                />

                {/* Email (Disabled) */}
                <Input
                  label="Email address"
                  value={email}
                  onChangeText={() => {}}
                  placeholder="Enter your email address"
                  icon={Mail}
                  editable={false}
                  error={errors.email}
                  containerStyle={styles.disabledInput}
                />

                {/* Phone Number */}
                <View style={styles.phoneContainer}>
                  <PhoneInput
                    label="Phone number"
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text);
                      if (errors.phone) {
                        setErrors({ ...errors, phone: null });
                      }
                    }}
                    placeholder="Enter your phone number"
                    defaultCountry="AE"
                    error={errors.phone}
                  />
                  {phone.trim() &&
                    !userToDisplay?.isPhoneVerified &&
                    normalizePhoneNumber(userToDisplay?.phone || "") !==
                      phone.trim() && (
                      <Button
                        title="Verify Number"
                        variant="outline"
                        onPress={handleOpenVerificationModal}
                        style={styles.verifyButton}
                      />
                    )}
                </View>
              </View>
            </View>
          </Card>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={handleCancel}
              style={styles.cancelButton}
            />
            <Button
              title={isSaving ? "Saving..." : "Save Changes"}
              onPress={handleSave}
              disabled={!hasChanges || isSaving}
              loading={isSaving}
              icon={
                !isSaving && <Save size={16} color={colors.primaryForeground} />
              }
              style={styles.saveButton}
            />
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* Phone Verification Modal */}
      <Modal
        visible={showVerificationModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseVerificationModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <Phone size={24} color={colors.primary} />
              </View>
              <Text style={styles.modalTitle}>
                {verificationStep === "send" && "Verify Phone Number"}
                {verificationStep === "verify" && "Enter Verification Code"}
                {verificationStep === "success" && "Phone Verified"}
              </Text>
              <Text style={styles.modalDescription}>
                {verificationStep === "send" &&
                  "We'll send a verification code to your phone number."}
                {verificationStep === "verify" &&
                  `We've sent a 6-digit code to ${phone}`}
                {verificationStep === "success" &&
                  "Your phone number has been verified successfully."}
              </Text>
            </View>

            {verificationStep === "send" && (
              <View style={styles.modalBody}>
                <Text style={styles.modalText}>
                  Phone number: {phone || "No phone number provided"}
                </Text>
                <View style={styles.modalActions}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={handleCloseVerificationModal}
                    disabled={sendingOtp}
                    style={styles.modalButton}
                  />
                  <Button
                    title={sendingOtp ? "Sending..." : "Send OTP"}
                    onPress={handleSendOtp}
                    disabled={sendingOtp || !phone.trim()}
                    loading={sendingOtp}
                    style={styles.modalButton}
                  />
                </View>
              </View>
            )}

            {verificationStep === "verify" && (
              <View style={styles.modalBody}>
                <OTPInput value={otp} onChange={setOtp} />
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={sendingOtp}
                  style={styles.resendButton}
                >
                  <Text style={styles.resendButtonText}>
                    {sendingOtp ? "Resending..." : "Resend code"}
                  </Text>
                </TouchableOpacity>
                <View style={styles.modalActions}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={handleCloseVerificationModal}
                    disabled={verifyingOtp}
                    style={styles.modalButton}
                  />
                  <Button
                    title={verifyingOtp ? "Verifying..." : "Verify Phone"}
                    onPress={handleVerifyOtp}
                    disabled={otp.length !== 6 || verifyingOtp}
                    loading={verifyingOtp}
                    style={styles.modalButton}
                  />
                </View>
              </View>
            )}

            {verificationStep === "success" && (
              <View style={styles.modalBody}>
                <View style={styles.successIcon}>
                  <CheckCircle size={64} color={colors.primary} />
                </View>
                <Text style={styles.successText}>
                  Your phone number has been verified and updated successfully.
                </Text>
                <Button
                  title="Done"
                  onPress={() => {
                    handleCloseVerificationModal();
                    // Optionally refresh user data
                    fetchUserData();
                  }}
                  style={styles.modalButtonFullWidth}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skeletonContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  skeleton: {
    height: 200,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: fontSizes.h1,
    fontWeight: "700",
    color: colors.foreground,
    marginBottom: spacing.xs / 2,
  },
  headerSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.mutedForeground,
  },
  headerSpacer: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + 100, // Extra padding for keyboard
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  formSection: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.h3,
    fontWeight: "600",
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: fontSizes.body,
    color: colors.mutedForeground,
    marginBottom: spacing.lg,
  },
  formFields: {
    gap: spacing.md,
  },
  disabledInput: {
    opacity: 0.6,
  },
  phoneContainer: {
    marginBottom: spacing.md,
  },
  verifyButton: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: fontSizes.h2,
    fontWeight: "600",
    color: colors.foreground,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: fontSizes.body,
    color: colors.mutedForeground,
    textAlign: "center",
  },
  modalBody: {
    gap: spacing.md,
  },
  modalText: {
    fontSize: fontSizes.body,
    color: colors.foreground,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  resendButton: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  resendButtonText: {
    fontSize: fontSizes.body,
    color: colors.primary,
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
  modalButtonFullWidth: {
    width: "100%",
  },
  successIcon: {
    alignItems: "center",
    marginVertical: spacing.md,
  },
  successText: {
    fontSize: fontSizes.body,
    color: colors.mutedForeground,
    textAlign: "center",
    marginBottom: spacing.md,
  },
});

export default EditProfileScreen;
