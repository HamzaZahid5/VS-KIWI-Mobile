/**
 * Forgot Password Screen
 * Password reset screen matching web app exactly
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../../theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import OTPInput from '../../components/OTPInput';
import { post } from '../../utils/api';
import { AUTH_ENDPOINTS } from '../../utils/constants';
import { isValidEmail } from '../../helpers/validationHelper';

const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState('email'); // 'email', 'otp', 'password', 'success'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const getTitle = () => {
    switch (step) {
      case 'email':
        return 'Reset password';
      case 'otp':
        return 'Enter verification code';
      case 'password':
        return 'Create new password';
      case 'success':
        return 'Password reset';
      default:
        return 'Reset password';
    }
  };

  const getDescription = () => {
    switch (step) {
      case 'email':
        return "Enter your email address and we'll send you a verification code.";
      case 'otp':
        return `We've sent a 6-digit code to ${email}`;
      case 'password':
        return 'Enter your new password below.';
      case 'success':
        return 'Your password has been reset successfully.';
      default:
        return '';
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }
    if (!isValidEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    try {
      await post(AUTH_ENDPOINTS.forgotPassword, { email });
      setStep('otp');
      Alert.alert('Verification code sent', 'Check your email for the OTP code.');
    } catch (error) {
      Alert.alert('Failed to send code', error.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid code', 'Please enter the 6-digit code.');
      return;
    }
    setStep('password');
  };

  const handleResetPassword = async () => {
    const newErrors = {};
    
    if (!newPassword || newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await post(AUTH_ENDPOINTS.resetPassword, {
        email,
        otp,
        newPassword,
      });
      setStep('success');
      Alert.alert('Password reset successful', 'You can now log in with your new password.');
    } catch (error) {
      Alert.alert('Failed to reset password', error.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await post(AUTH_ENDPOINTS.forgotPassword, { email });
      Alert.alert('Verification code resent', 'Check your email for the new OTP code.');
    } catch (error) {
      Alert.alert('Failed to resend code', error.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('email');
      setOtp('');
    } else if (step === 'password') {
      setStep('otp');
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {step !== 'success' && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getTitle()}</Text>
          <View style={styles.headerSpacer} />
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card}>
          <Card.Header>
            <Card.Title>{getTitle()}</Card.Title>
            <Card.Description>{getDescription()}</Card.Description>
          </Card.Header>

          <Card.Content>
            {step === 'email' && (
              <>
                <Input
                  label="Email address"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors({ ...errors, email: null });
                  }}
                  placeholder="your@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                  icon={() => <Ionicons name="mail-outline" />}
                />

                <Button
                  title="Send verification code"
                  onPress={handleSendOtp}
                  loading={loading}
                  style={styles.sendButton}
                />

                <View style={styles.loginLink}>
                  <Text style={styles.loginText}>Remember your password? </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.loginLinkText}>Log in</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {step === 'otp' && (
              <>
                <View style={styles.otpContainer}>
                  <OTPInput value={otp} onChange={setOtp} maxLength={6} />
                </View>

                <Button
                  title="Continue"
                  onPress={handleVerifyOtp}
                  disabled={otp.length !== 6}
                  style={styles.continueButton}
                />

                <View style={styles.resendContainer}>
                  <Button
                    title={loading ? 'Resending...' : 'Resend code'}
                    variant="ghost"
                    onPress={handleResendOtp}
                    disabled={loading}
                    textStyle={styles.resendText}
                  />
                </View>
              </>
            )}

            {step === 'password' && (
              <>
                <Input
                  label="New password"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    setErrors({ ...errors, newPassword: null });
                  }}
                  placeholder="Enter new password"
                  secureTextEntry
                  error={errors.newPassword}
                  icon={() => <Ionicons name="lock-closed-outline" />}
                />

                <Input
                  label="Confirm password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setErrors({ ...errors, confirmPassword: null });
                  }}
                  placeholder="Confirm new password"
                  secureTextEntry
                  error={errors.confirmPassword}
                  icon={() => <Ionicons name="lock-closed-outline" />}
                />

                <Button
                  title="Reset password"
                  onPress={handleResetPassword}
                  loading={loading}
                  style={styles.resetButton}
                />
              </>
            )}

            {step === 'success' && (
              <View style={styles.successContainer}>
                <View style={styles.successIconContainer}>
                  <Ionicons name="checkmark-circle" size={64} color={colors.success} />
                </View>
                <Text style={styles.successText}>
                  Your password has been successfully reset. You can now log in with your new password.
                </Text>
                <Button
                  title="Go to login"
                  onPress={() => navigation.navigate('Login')}
                  style={styles.goToLoginButton}
                />
              </View>
            )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontWeight: '700',
    color: colors.foreground,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  card: {
    width: '100%',
    alignSelf: 'center',
  },
  sendButton: {
    marginTop: spacing.md,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  loginText: {
    fontSize: fontSizes.bodySmall,
    color: colors.mutedForeground,
  },
  loginLinkText: {
    fontSize: fontSizes.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  otpContainer: {
    marginVertical: spacing.lg,
  },
  continueButton: {
    marginTop: spacing.md,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  resendText: {
    color: colors.primary,
  },
  resetButton: {
    marginTop: spacing.md,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  successIconContainer: {
    marginBottom: spacing.lg,
  },
  successText: {
    fontSize: fontSizes.body,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  goToLoginButton: {
    width: '100%',
  },
});

export default ForgotPasswordScreen;

