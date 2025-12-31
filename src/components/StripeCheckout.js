/**
 * Stripe Checkout Component for React Native
 * Matches web app's StripeCheckout functionality
 */

import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, Platform } from "react-native";
import { useStripe, usePaymentSheet } from "@stripe/stripe-react-native";
import * as Linking from "expo-linking";
import Constants from "expo-constants";
import { CreditCard, AlertCircle, Check } from "lucide-react-native";
import { colors, fontSizes, spacing, borderRadius } from "../theme";
import Card from "./Card";
import Button from "./Button";
import { post } from "../utils/api";
import { paymentEndpoints } from "../utils/constants";
import { STRIPE_PUBLIC_KEY } from "../utils/constants";

// Validate Stripe public key format
const getStripePublicKey = () => {
  if (!STRIPE_PUBLIC_KEY) {
    console.error("STRIPE_PUBLIC_KEY is not set in environment variables");
    return null;
  }

  const trimmedKey = STRIPE_PUBLIC_KEY.trim()
    .replace(/\\+$/, "")
    .replace(/\n+$/, "")
    .replace(/\r+$/, "");

  if (!trimmedKey) {
    console.error("STRIPE_PUBLIC_KEY is empty after trimming");
    return null;
  }

  if (
    !trimmedKey.startsWith("pk_test_") &&
    !trimmedKey.startsWith("pk_live_")
  ) {
    console.error(
      "Invalid Stripe public key format. Keys should start with pk_test_ or pk_live_"
    );
    return null;
  }

  return trimmedKey;
};

// Get URL scheme for Stripe redirects
const getUrlScheme = () => {
  if (Constants.appOwnership === "expo") {
    return Linking.createURL("/--/");
  }
  return Linking.createURL("");
};

const StripeCheckout = ({
  amount,
  currency = "aed",
  orderId,
  clientSecret: providedClientSecret,
  onSuccess,
  onCancel,
}) => {
  const stripe = useStripe();
  const [clientSecret, setClientSecret] = useState(
    providedClientSecret || null
  );
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!providedClientSecret);
  const [processing, setProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef(false);

  const {
    initPaymentSheet,
    presentPaymentSheet,
    loading: paymentSheetLoading,
  } = usePaymentSheet();

  const initializePaymentSheet = React.useCallback(async (secret) => {
    if (!stripe || initializationRef.current) {
      return; // Already initializing or initialized
    }

    initializationRef.current = true;

    try {
      // Add a small delay for Android to avoid onSaveInstanceState error
      if (Platform.OS === "android") {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      const returnURL = getUrlScheme();
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: secret,
        merchantDisplayName: "Kiwi Rentals",
        allowsDelayedPaymentMethods: true,
        returnURL: returnURL,
        applePay: {
          merchantCountryCode: "AE",
        },
        googlePay: {
          merchantCountryCode: "AE",
          testEnv: STRIPE_PUBLIC_KEY?.startsWith("pk_test_") || false,
        },
      });

      if (initError) {
        console.error("Payment sheet initialization error:", initError);
        // Don't set error for onSaveInstanceState - it's a timing issue
        if (initError.message && !initError.message.includes("onSaveInstanceState")) {
          setError(initError.message || "Failed to initialize payment sheet");
        }
        initializationRef.current = false;
      } else {
        setIsInitialized(true);
        console.log("Payment sheet initialized successfully");
      }
    } catch (err) {
      console.error("Payment sheet initialization error:", err);
      // Don't set error for onSaveInstanceState - it's a timing issue
      if (err.message && !err.message.includes("onSaveInstanceState")) {
        setError(err.message || "Failed to initialize payment sheet");
      }
      initializationRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stripe]);

  useEffect(() => {
    if (!stripe || initializationRef.current) {
      return; // Wait for Stripe to initialize or already initializing
    }

    // If clientSecret is provided, use it directly
    if (providedClientSecret) {
      setClientSecret(providedClientSecret);
      setLoading(false);
      // Delay initialization slightly to ensure component is fully mounted
      setTimeout(() => {
        initializePaymentSheet(providedClientSecret);
      }, 100);
      return;
    }

    // Otherwise, create a new payment intent
    const createPaymentIntent = async () => {
      try {
        const response = await post(paymentEndpoints.createPaymentIntent, {
          orderId,
        });
        const data = response?.data;
        if (data?.data?.clientSecret) {
          setClientSecret(data.data.clientSecret);
          setLoading(false);
          // Delay initialization slightly to ensure component is fully mounted
          setTimeout(() => {
            initializePaymentSheet(data.data.clientSecret);
          }, 100);
        } else {
          console.error("StripeCheckout - No clientSecret in response:", data);
          setError("Failed to initialize payment. Please try again.");
          setLoading(false);
        }
      } catch (err) {
        console.error("StripeCheckout - Payment intent error:", err);
        setError("Failed to initialize payment. Please try again.");
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [providedClientSecret, orderId, stripe, initializePaymentSheet]);

  const handlePayment = async () => {
    if (!stripe) {
      Alert.alert("Error", "Stripe is not initialized");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code !== "Canceled") {
          setError(presentError.message || "Payment failed");
          Alert.alert(
            "Payment Error",
            presentError.message || "Payment failed"
          );
        } else {
          // User canceled - don't show error
          onCancel();
        }
        setProcessing(false);
        return;
      }

      // Payment succeeded
      onSuccess();
      setProcessing(false);
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Payment failed");
      Alert.alert("Payment Error", err.message || "Payment failed");
      setProcessing(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(value);
  };

  const stripePublicKey = getStripePublicKey();

  if (!stripePublicKey) {
    return (
      <Card style={styles.card}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={colors.mutedForeground} />
          <Text style={styles.errorText}>
            Payment is not configured. Please contact support or use Cash on
            Delivery.
          </Text>
          <Text style={styles.errorSubtext}>
            {!STRIPE_PUBLIC_KEY
              ? "EXPO_PUBLIC_STRIPE_PUBLIC_KEY environment variable is not set or invalid."
              : "Stripe public key format is invalid. Keys should start with pk_test_ or pk_live_."}
          </Text>
          <Button
            title="Go Back"
            onPress={onCancel}
            variant="outline"
            style={styles.cancelButton}
          />
        </View>
      </Card>
    );
  }

  if (loading || (paymentSheetLoading && !isInitialized)) {
    return (
      <Card style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Preparing payment...</Text>
        </View>
      </Card>
    );
  }

  if (error || !clientSecret) {
    console.error("StripeCheckout - Error or missing clientSecret:", {
      error,
      clientSecret: clientSecret ? "Set" : "Not set",
    });
    return (
      <Card style={styles.card}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={colors.error} />
          <Text style={styles.errorText}>
            {error || "Failed to load payment form"}
          </Text>
          {!clientSecret && !error && (
            <Text style={styles.errorSubtext}>
              Client secret is missing. Please check the console for details.
            </Text>
          )}
          <Button
            title="Go Back"
            onPress={onCancel}
            variant="outline"
            style={styles.cancelButton}
          />
        </View>
      </Card>
    );
  }

  // Validate clientSecret format
  if (clientSecret && !clientSecret.includes("_secret_")) {
    console.error(
      "Invalid clientSecret format. Expected format: pi_xxx_secret_xxx"
    );
    return (
      <Card style={styles.card}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={colors.error} />
          <Text style={styles.errorText}>
            Invalid payment configuration. Please try again.
          </Text>
          <Text style={styles.errorSubtext}>
            The payment intent secret is invalid. Please contact support.
          </Text>
          <Button
            title="Go Back"
            onPress={onCancel}
            variant="outline"
            style={styles.cancelButton}
          />
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <CreditCard size={24} color={colors.primary} />
        <Text style={styles.title}>Secure Payment</Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Amount to pay</Text>
        <Text style={styles.amountValue}>{formatCurrency(amount)}</Text>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <AlertCircle size={16} color={colors.error} />
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <Button
          title={processing ? "Processing..." : `Pay ${formatCurrency(amount)}`}
          onPress={handlePayment}
          disabled={!stripe || processing || paymentSheetLoading}
          loading={processing}
          icon={
            processing ? null : <Check size={20} color={colors.textWhite} />
          }
          style={styles.payButton}
        />

        <Button
          title="Cancel"
          onPress={onCancel}
          variant="destructive"
          disabled={processing}
          style={styles.cancelButton}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Secure payment powered by Stripe</Text>
        <Text style={styles.footerSubtext}>
          Supports Apple Pay, Google Pay, and all major cards
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSizes.h3,
    fontWeight: "700",
    color: colors.foreground,
  },
  amountContainer: {
    padding: spacing.lg,
    backgroundColor: colors.muted + "80",
    borderRadius: borderRadius.medium,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  amountLabel: {
    fontSize: fontSizes.bodySmall,
    color: colors.mutedForeground,
    marginBottom: spacing.xs,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.foreground,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.error + "10",
    borderRadius: borderRadius.medium,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    fontSize: fontSizes.bodySmall,
    color: colors.error,
    flex: 1,
  },
  actions: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  payButton: {
    width: "100%",
  },
  cancelButton: {
    width: "100%",
  },
  footer: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  footerText: {
    fontSize: fontSizes.caption,
    color: colors.mutedForeground,
    marginBottom: spacing.xs / 2,
  },
  footerSubtext: {
    fontSize: fontSizes.caption,
    color: colors.mutedForeground,
  },
  loadingContainer: {
    alignItems: "center",
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: fontSizes.body,
    color: colors.mutedForeground,
    marginTop: spacing.md,
  },
  errorContainer: {
    alignItems: "center",
    padding: spacing.xl,
  },
  errorText: {
    fontSize: fontSizes.body,
    color: colors.mutedForeground,
    textAlign: "center",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorSubtext: {
    fontSize: fontSizes.caption,
    color: colors.mutedForeground,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
});

export default StripeCheckout;
