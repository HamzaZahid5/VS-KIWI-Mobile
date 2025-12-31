/**
 * Payment Screen
 * Handles Stripe payment processing, matching web app functionality
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
  ActivityIndicator,
} from "react-native";
import { ChevronLeft, AlertCircle, CheckCircle } from "lucide-react-native";
import { colors, fontSizes, spacing, borderRadius } from "../../theme";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Skeleton from "../../components/Skeleton";
import StripeCheckout from "../../components/StripeCheckout";
import { get } from "../../utils/api";
import { ordersEndpoints } from "../../utils/constants";

const PaymentScreen = ({ navigation, route }) => {
  const { orderId, clientSecret: providedClientSecret } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  useEffect(() => {
    if (order?.totalPrice) {
      setAmount(parseFloat(order.totalPrice));
    }
  }, [order]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await get(ordersEndpoints.getById(orderId));
      setOrder(response?.data || null);
    } catch (error) {
      console.error("Error fetching order details:", error);
      Alert.alert("Error", "Failed to load order details");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };


  const handlePaymentSuccess = async () => {
    // Invalidate order cache by refetching
    try {
      await fetchOrderDetails();
      Alert.alert(
        "Payment Successful!",
        "Your booking has been confirmed.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("BookingDetails", { orderId }),
          },
        ]
      );
    } catch (error) {
      console.error("Error after payment success:", error);
      navigation.navigate("BookingDetails", { orderId });
    }
  };

  const handlePaymentCancel = () => {
    navigation.navigate("BookingDetails", { orderId });
  };

  // Early return after all hooks
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={colors.mutedForeground} />
          <Text style={styles.errorTitle}>Order not found</Text>
          <Text style={styles.errorText}>
            The order you're looking for doesn't exist.
          </Text>
          <Button
            title="Go back home"
            onPress={() => navigation.navigate("Home")}
            variant="outline"
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Check if order is already paid
  if (order.paymentStatus === "paid") {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.navigate("BookingDetails", { orderId })}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ChevronLeft size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Complete Payment</Text>
            <View style={styles.headerSpacer} />
          </View>

          <Card style={styles.statusCard}>
            <View style={styles.statusContent}>
              <CheckCircle size={48} color={colors.primary} />
              <Text style={styles.statusTitle}>Order already paid</Text>
              <Text style={styles.statusText}>
                This order has already been paid. You can view the booking details.
              </Text>
              <Button
                title="View booking details"
                onPress={() => navigation.navigate("BookingDetails", { orderId })}
                style={styles.statusButton}
              />
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Check if payment method is stripe
  if (order.paymentMethod !== "stripe") {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.navigate("BookingDetails", { orderId })}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ChevronLeft size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Complete Payment</Text>
            <View style={styles.headerSpacer} />
          </View>

          <Card style={styles.statusCard}>
            <View style={styles.statusContent}>
              <AlertCircle size={48} color={colors.mutedForeground} />
              <Text style={styles.statusTitle}>Invalid payment method</Text>
              <Text style={styles.statusText}>
                This order is not set up for card payment. Please use the booking details page.
              </Text>
              <Button
                title="Go to booking details"
                onPress={() => navigation.navigate("BookingDetails", { orderId })}
                variant="outline"
                style={styles.statusButton}
              />
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate("BookingDetails", { orderId })}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complete Payment</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.subtitle}>
          Please complete your payment to confirm your booking.
        </Text>

        {/* Stripe Checkout Component */}
        <StripeCheckout
          amount={amount}
          currency="aed"
          orderId={orderId}
          clientSecret={providedClientSecret}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

function LoadingSkeleton() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Skeleton width="100%" height={32} style={styles.skeleton} />
        <Skeleton width="100%" height={200} style={styles.skeleton} />
        <Skeleton width="100%" height={300} style={styles.skeleton} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSizes.h1,
    fontWeight: "700",
    color: colors.foreground,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  subtitle: {
    fontSize: fontSizes.body,
    color: colors.mutedForeground,
    marginBottom: spacing.lg,
  },
  paymentCard: {
    marginBottom: spacing.lg,
  },
  paymentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  paymentTitle: {
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
  paymentForm: {
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  paymentFormText: {
    fontSize: fontSizes.body,
    color: colors.foreground,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  paymentFormSubtext: {
    fontSize: fontSizes.bodySmall,
    color: colors.mutedForeground,
    textAlign: "center",
  },
  loadingIndicator: {
    marginTop: spacing.sm,
  },
  processingContainer: {
    alignItems: "center",
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  processingText: {
    fontSize: fontSizes.body,
    color: colors.mutedForeground,
    marginTop: spacing.sm,
  },
  paymentActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  payButton: {
    flex: 2,
  },
  statusCard: {
    marginTop: spacing.xl,
  },
  statusContent: {
    alignItems: "center",
    padding: spacing.xl,
  },
  statusTitle: {
    fontSize: fontSizes.h2,
    fontWeight: "600",
    color: colors.foreground,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  statusText: {
    fontSize: fontSizes.body,
    color: colors.mutedForeground,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  statusButton: {
    minWidth: 200,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: fontSizes.h2,
    fontWeight: "600",
    color: colors.foreground,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: fontSizes.body,
    color: colors.mutedForeground,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  errorButton: {
    marginTop: spacing.md,
  },
  skeleton: {
    marginBottom: spacing.lg,
  },
});

export default PaymentScreen;

