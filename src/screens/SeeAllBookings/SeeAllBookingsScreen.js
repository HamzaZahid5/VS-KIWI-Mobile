/**
 * See All Bookings Screen
 * Shows all active/upcoming bookings with tab switcher
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  StatusBar,
} from "react-native";
import { useSelector } from "react-redux";
import { ChevronLeft, AlertCircle, Clock } from "lucide-react-native";
import { colors, spacing, fontSizes, borderRadius } from "../../theme";
import { selectUser, selectIsAuthenticated } from "../../redux/authSlice";
import BookingCard from "../../components/BookingCard";
import EmptyState from "../../components/EmptyState";
import Skeleton from "../../components/Skeleton";
import TabSwitcher from "../../components/TabSwitcher";
import { get } from "../../utils/api";
import { ordersEndpoints } from "../../utils/constants";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const SeeAllBookingsScreen = ({ navigation, route }) => {
  const { initialTab = "active" } = route.params || {};
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [activeOrdersData, setActiveOrdersData] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab); // 'active' or 'upcoming'

  const fetchActiveOrders = async () => {
    if (!isAuthenticated || !user) {
      setOrdersLoading(false);
      return;
    }

    try {
      setOrdersLoading(true);
      const response = await get(ordersEndpoints.active);
      setActiveOrdersData(response);
    } catch (error) {
      console.error("Error fetching active orders:", error);
      setActiveOrdersData({ data: [] });
    } finally {
      setOrdersLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActiveOrders();
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Update tab if initialTab changes
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActiveOrders();
  };

  const handleBookingPress = (orderId) => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate("BookingDetails", { orderId, fromScreen: "SeeAllBookings" });
    } else {
      navigation.navigate("BookingDetails", { orderId, fromScreen: "SeeAllBookings" });
    }
  };

  // Filter active bookings - matching web app logic exactly
  const activeBookings = React.useMemo(() => {
    if (!activeOrdersData?.data || !Array.isArray(activeOrdersData.data)) {
      return [];
    }
    return activeOrdersData.data.filter((order) => {
      return order.status === "delivered";
    });
  }, [activeOrdersData]);

  // Filter upcoming bookings - matching web app logic exactly
  const upcomingBookings = React.useMemo(() => {
    if (!activeOrdersData?.data || !Array.isArray(activeOrdersData.data)) {
      return [];
    }

    const now = new Date();

    return activeOrdersData.data.filter((order) => {
      if (order.deliveredAt) {
        return false;
      }
      if (order.bookingType === "pre_book" && order.scheduledDate) {
        const scheduledDateTime = new Date(order.scheduledDate);
        if (order.scheduledTime) {
          const [hours, minutes] = order.scheduledTime.split(":").map(Number);
          scheduledDateTime.setHours(hours, minutes, 0, 0);
        }
        return scheduledDateTime >= now;
      }
      if (order.bookingType === "order_now" && order.scheduledDate) {
        return new Date(order.scheduledDate) >= now;
      }
      return false;
    });
  }, [activeOrdersData]);

  const currentBookings = activeTab === "active" ? activeBookings : upcomingBookings;

  // Show loading skeleton only on initial load
  if (ordersLoading && !activeOrdersData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={"dark-content"} />
        <View style={styles.skeletonContainer}>
          <Skeleton style={styles.skeleton} />
          <Skeleton style={styles.skeleton} />
          <Skeleton style={styles.skeleton} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={"dark-content"} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            const parent = navigation.getParent();
            if (parent) {
              parent.navigate("MainTabs", { screen: "HomeTab" });
            } else {
              navigation.goBack();
            }
          }}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabSwitcherWrapper}>
        <TabSwitcher
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeCount={activeBookings.length}
          upcomingCount={upcomingBookings.length}
        />
      </View>

      {/* Bookings List */}
      {ordersLoading ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              width="100%"
              height={220}
              style={styles.skeletonCard}
            />
          ))}
        </View>
      ) : (
        <FlatList
          data={currentBookings}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            currentBookings.length === 0
              ? styles.emptyListContent
              : styles.listContent
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <EmptyState
                icon={activeTab === "active" ? Clock : AlertCircle}
                title={
                  activeTab === "active"
                    ? "No active bookings"
                    : "No upcoming bookings"
                }
                description={
                  activeTab === "active"
                    ? "You don't have any active bookings at the moment."
                    : "Start your beach adventure by booking beanbags today!"
                }
                buttonText={activeTab === "active" ? undefined : "Book Now"}
                onButtonPress={
                  activeTab === "active"
                    ? undefined
                    : () => {
                        const parent = navigation.getParent();
                        if (parent) {
                          parent.navigate("MainTabs", {
                            screen: "NewBookingTab",
                          });
                        }
                      }
                }
              />
            </View>
          }
          renderItem={({ item: order }) => (
            <BookingCard
              order={order}
              onPress={() => handleBookingPress(order.id)}
            />
          )}
        />
      )}
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
    height: 220,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.md,
  },
  skeletonCard: {
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
  tabSwitcherWrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    minHeight: 400,
  },
  emptyContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SeeAllBookingsScreen;

