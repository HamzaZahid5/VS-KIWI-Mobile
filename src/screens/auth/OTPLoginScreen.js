/**
 * OTP Login Screen
 * OTP-based login screen matching web app exactly
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
import { OTP_ENDPOINTS } from '../../utils/constants';
import { isValidEmail, isValidPhone } from '../../helpers/validationHelper';

const OTPLoginScreen = ({ navigation }) => {
  const [step, setStep] = useState('input'); // 'input' or 'verify'
  const [channel, setChannel] = useState('email'); // 'email' or 'sms'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    setError('');
    
    if (channel === 'email' && !email) {
      setError('Please enter your email address');
      return;
    }
    if (channel === 'sms' && !phone) {
      setError('Please enter your phone number');
      return;
    }
    
    if (channel === 'email' && !isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (channel === 'sms' && !isValidPhone(phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      await post(OTP_ENDPOINTS.send, {
        email: channel === 'email' ? email : undefined,
        phone: channel === 'sms' ? phone : undefined,
        channel,
      });

      setStep('verify');
      Alert.alert(
        'Verification code sent',
        `Check your ${channel === 'email' ? 'inbox' : 'phone'} for the code.`
      );
    } catch (error) {
      Alert.alert('Failed to send code', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid code', 'Please enter the 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const response = await post(OTP_ENDPOINTS.verify, {
        email: channel === 'email' ? email : undefined,
        phone: channel === 'sms' ? phone : undefined,
        otp,
      });

      if (response.token) {
        // Store token and navigate
        // This would typically update auth state
        Alert.alert('Verified successfully', 'You are now logged in.');
        navigation.replace('Home');
      }
    } catch (error) {
      Alert.alert('Verification failed', error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await post(OTP_ENDPOINTS.send, {
        email: channel === 'email' ? email : undefined,
        phone: channel === 'sms' ? phone : undefined,
        channel,
      });
      Alert.alert('Code resent', 'A new verification code has been sent.');
    } catch (error) {
      Alert.alert('Failed to resend', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (step === 'verify') {
              setStep('input');
              setOtp('');
            } else if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Login');
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify your identity</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card}>
          <Card.Header>
            <Card.Title>
              {step === 'input' ? 'Sign in with OTP' : 'Enter verification code'}
            </Card.Title>
            <Card.Description>
              {step === 'input'
                ? 'We will send you a verification code'
                : `Code sent to ${channel === 'email' ? email : phone}`}
            </Card.Description>
          </Card.Header>

          <Card.Content>
            {step === 'input' ? (
              <>
                <View style={styles.tabs}>
                  <TouchableOpacity
                    style={[
                      styles.tab,
                      channel === 'email' && styles.tabActive,
                    ]}
                    onPress={() => {
                      setChannel('email');
                      setError('');
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={16}
                      color={channel === 'email' ? colors.primary : colors.mutedForeground}
                    />
                    <Text
                      style={[
                        styles.tabText,
                        channel === 'email' && styles.tabTextActive,
                      ]}
                    >
                      Email
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.tab,
                      channel === 'sms' && styles.tabActive,
                    ]}
                    onPress={() => {
                      setChannel('sms');
                      setError('');
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="call-outline"
                      size={16}
                      color={channel === 'sms' ? colors.primary : colors.mutedForeground}
                    />
                    <Text
                      style={[
                        styles.tabText,
                        channel === 'sms' && styles.tabTextActive,
                      ]}
                    >
                      SMS
                    </Text>
                  </TouchableOpacity>
                </View>

                {channel === 'email' ? (
                  <Input
                    label="Email address"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setError('');
                    }}
                    placeholder="your@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={error}
                    icon={() => <Ionicons name="mail-outline" />}
                  />
                ) : (
                  <Input
                    label="Phone number"
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text);
                      setError('');
                    }}
                    placeholder="+971 50 123 4567"
                    keyboardType="phone-pad"
                    error={error}
                    icon={() => <Ionicons name="call-outline" />}
                  />
                )}

                <Button
                  title="Send verification code"
                  onPress={handleSendOtp}
                  loading={loading}
                  style={styles.sendButton}
                />

                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Button
                  title="Continue with social login"
                  variant="outline"
                  onPress={() => navigation.navigate('Login')}
                />
              </>
            ) : (
              <>
                <View style={styles.otpContainer}>
                  <OTPInput value={otp} onChange={setOtp} maxLength={6} />
                </View>

                <Button
                  title="Verify and continue"
                  onPress={handleVerifyOtp}
                  loading={loading}
                  disabled={otp.length !== 6}
                  style={styles.verifyButton}
                />

                <View style={styles.resendContainer}>
                  <Button
                    title="Resend code"
                    variant="ghost"
                    onPress={handleResendOtp}
                    disabled={loading}
                    textStyle={styles.resendText}
                  />
                </View>
              </>
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.input,
    borderRadius: 8,
    padding: 4,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 6,
    gap: spacing.xs,
  },
  tabActive: {
    backgroundColor: colors.background,
  },
  tabText: {
    fontSize: fontSizes.bodySmall,
    color: colors.mutedForeground,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  sendButton: {
    marginTop: spacing.md,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: spacing.sm,
    fontSize: fontSizes.caption,
    color: colors.mutedForeground,
    fontWeight: '500',
  },
  otpContainer: {
    marginVertical: spacing.lg,
  },
  verifyButton: {
    marginTop: spacing.md,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  resendText: {
    color: colors.primary,
  },
});

export default OTPLoginScreen;

