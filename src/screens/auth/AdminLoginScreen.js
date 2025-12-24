/**
 * Admin Login Screen
 * Admin login screen matching web app exactly
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
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../../theme';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import { post } from '../../utils/api';
import { AUTH_ENDPOINTS } from '../../utils/constants';
import { setAuth } from '../../redux/authSlice';
import { storeAuthToken, storeData } from '../../utils/storage';
import { STORAGE_KEYS } from '../../utils/constants';
import { isValidEmail } from '../../helpers/validationHelper';

const AdminLoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      const response = await post(AUTH_ENDPOINTS.adminLogin, {
        email,
        password,
      });

      if (response.data && response.data.token && response.data.user) {
        // Store auth data
        await storeAuthToken(response.data.token);
        await storeData(STORAGE_KEYS.USER_DATA, response.data.user);
        
        // Update Redux store
        dispatch(setAuth({
          token: response.data.token,
          user: response.data.user,
          refreshToken: response.data.refreshToken,
        }));

        // Navigate to admin dashboard
        // For now, navigate to home. In production, navigate to admin screen
        navigation.replace('Home');
      }
    } catch (error) {
      Alert.alert('Login failed', error.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
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
        <Text style={styles.headerTitle}>Log in</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card}>
          <Card.Header>
            <Card.Title>Welcome back</Card.Title>
            <Card.Description>Log in to your account to continue</Card.Description>
          </Card.Header>

          <Card.Content>
            <Input
              label="Email address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              icon={() => <Ionicons name="mail-outline" />}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              placeholder="Enter your password"
              secureTextEntry
              error={errors.password}
              icon={() => <Ionicons name="lock-closed-outline" />}
            />

            <Button
              title="Log in"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />
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
  loginButton: {
    marginTop: spacing.md,
  },
});

export default AdminLoginScreen;

