/**
 * Home Screen
 * User home screen matching web app exactly
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  StatusBar,
  Dimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
  MapPin,
  Calendar,
  DollarSign,
  AlertCircle,
  ShoppingBag,
  Clock,
  ChevronRight,
} from "lucide-react-native";
import { format } from "date-fns";
import { colors } from "../../theme";
import { selectUser, selectIsAuthenticated } from "../../redux/authSlice";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import StatCard from "../../components/StatCard";
import BookingCard from "../../components/BookingCard";
import EmptyState from "../../components/EmptyState";
import Skeleton from "../../components/Skeleton";
import TabSwitcher from "../../components/TabSwitcher";
import { get } from "../../utils/api";
import { ordersEndpoints } from "../../utils/constants";
import { withOpacity } from "../../utils/colorHelper";
import { styles } from "./HomeScreen.styles";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// Note: ordersEndpoints is imported from constants, matching web app structure

const HomeScreen = ({ navigation }) => {
  // This is the NEW Home screen matching web app - src/screens/Home/HomeScreen.js
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [activeOrdersData, setActiveOrdersData] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [userStatsData, setUserStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("active"); // 'active' or 'upcoming'

  const fetchActiveOrders = async () => {
    if (!isAuthenticated || !user) {
      setOrdersLoading(false);
      return;
    }

    try {
      setOrdersLoading(true);
      const response = await get(ordersEndpoints.active);
      console.log("Active orders response:", response);
      console.log("Active orders data:", response?.data);
      console.log(
        "Active orders count:",
        Array.isArray(response?.data) ? response.data.length : 0
      );

      setActiveOrdersData(response);
    } catch (error) {
      console.error("Error fetching active orders:", error);
      setActiveOrdersData({ data: [] });
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchUserStats = async () => {
    if (!isAuthenticated || !user) {
      setStatsLoading(false);
      return;
    }

    try {
      setStatsLoading(true);
      const response = await get(ordersEndpoints.stats);
      console.log("User stats response:", response);
      setUserStatsData(response);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      setUserStatsData({ data: { totalSpent: 0, totalBeanbags: 0 } });
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveOrders();
    fetchUserStats();
  }, [isAuthenticated, user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchActiveOrders(), fetchUserStats()]);
    setRefreshing(false);
  };

  const handleBookingPress = (orderId) => {
    // Navigate to BookingDetails (parent stack navigator)
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate("BookingDetails", { orderId });
    } else {
      navigation.navigate("BookingDetails", { orderId });
    }
  };

  // Filter active bookings - matching web app logic exactly
  const activeBookings = React.useMemo(() => {
    if (!activeOrdersData?.data || !Array.isArray(activeOrdersData.data)) {
      console.log("Active bookings: No data or not array", activeOrdersData);
      return [];
    }
    const filtered = activeOrdersData.data.filter((order) => {
      return order.status === "delivered";
    });
    console.log(
      "Active bookings - Total orders:",
      activeOrdersData.data.length,
      "Filtered (delivered):",
      filtered.length
    );
    if (activeOrdersData.data.length > 0) {
      console.log(
        "Order statuses:",
        activeOrdersData.data.map((o) => ({
          id: o.id?.slice(0, 8),
          status: o.status,
          deliveredAt: o.deliveredAt,
        }))
      );
    }
    return filtered;
  }, [activeOrdersData]);

  // Filter upcoming bookings - matching web app logic exactly
  const upcomingBookings = React.useMemo(() => {
    if (!activeOrdersData?.data || !Array.isArray(activeOrdersData.data)) {
      console.log("Upcoming bookings: No data or not array");
      return [];
    }

    const now = new Date();

    const filtered = activeOrdersData.data.filter((order) => {
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
    console.log(
      "Upcoming bookings - Total orders:",
      activeOrdersData.data.length,
      "Filtered:",
      filtered.length
    );
    if (activeOrdersData.data.length > 0) {
      console.log(
        "Upcoming filter check:",
        activeOrdersData.data.map((o) => ({
          id: o.id?.slice(0, 8),
          status: o.status,
          deliveredAt: o.deliveredAt,
          bookingType: o.bookingType,
          scheduledDate: o.scheduledDate,
          scheduledTime: o.scheduledTime,
        }))
      );
    }
    return filtered;
  }, [activeOrdersData]);

  // Show only first item on home screen - must be defined after upcomingBookings
  const activeBookingsHome = React.useMemo(() => {
    if (!activeBookings || !Array.isArray(activeBookings)) {
      return [];
    }
    return activeBookings.slice(0, 1);
  }, [activeBookings]);

  const upcomingBookingsHome = React.useMemo(() => {
    if (!upcomingBookings || !Array.isArray(upcomingBookings)) {
      return [];
    }
    return upcomingBookings.slice(0, 1);
  }, [upcomingBookings]);

  // Show loading skeleton only on initial load
  if (ordersLoading && !activeOrdersData) {
    return <LoadingSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={"dark-content"} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.welcomeTitle}>Kiwi</Text>
          <Text style={styles.welcomeSubtitle}>
            Hi{user?.firstName ? `, ${user.firstName}` : ""} 👋!
          </Text>
        </View>

        {/* Stats Cards Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCardWrapper}>
              <StatCard
                title="Active Bookings"
                value={
                  Array.isArray(activeBookings) ? activeBookings.length : 0
                }
                icon={Clock}
                iconBgColor={withOpacity(colors.primary, 0.1)}
                iconColor={colors.primary}
              />
            </View>
            <View style={styles.statCardWrapper}>
              <StatCard
                title="Upcoming Bookings"
                value={
                  Array.isArray(upcomingBookings) ? upcomingBookings.length : 0
                }
                icon={Calendar}
                iconBgColor={withOpacity("#3B82F6", 0.1)}
                iconColor="#3B82F6"
              />
            </View>
            <View style={styles.statCardWrapper}>
              <StatCard
                title="Total Spent"
                value={
                  statsLoading
                    ? "..."
                    : `$${(userStatsData?.data?.totalSpent || 0).toFixed(2)}`
                }
                icon={DollarSign}
                iconBgColor={withOpacity("#10B981", 0.1)}
                iconColor="#10B981"
              />
            </View>
            <View style={styles.statCardWrapper}>
              <StatCard
                title="Total Beanbags"
                value={
                  statsLoading
                    ? "..."
                    : (userStatsData?.data?.totalBeanbags || 0).toString()
                }
                icon={ShoppingBag}
                iconBgColor={withOpacity("#F97316", 0.1)}
                iconColor="#F97316"
              />
            </View>
          </View>
        </View>

        {/* Bookings Section with Tab Switcher */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Bookings</Text>
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

          {/* Active Bookings Content */}
          {activeTab === "active" && (
            <View style={styles.tabContent}>
              {ordersLoading ? (
                <View style={styles.skeletonGrid}>
                  <Skeleton
                    width="100%"
                    height={220}
                    style={styles.skeletonCard}
                  />
                </View>
              ) : Array.isArray(activeBookingsHome) &&
                activeBookingsHome.length > 0 ? (
                <FlatList
                  data={activeBookingsHome}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.verticalScrollContent}
                  scrollEnabled={false}
                  nestedScrollEnabled={true}
                  ListHeaderComponent={
                    <View style={styles.listHeaderRow}>
                      <Text style={styles.listHeaderTitle}>Active Bookings</Text>
                      {activeBookings.length > 0 && (
                        <TouchableOpacity
                          style={styles.seeAllButton}
                          onPress={() => {
                            const parent = navigation.getParent();
                            if (parent) {
                              parent.navigate("SeeAllBookings", {
                                initialTab: "active",
                              });
                            } else {
                              navigation.navigate("SeeAllBookings", {
                                initialTab: "active",
                              });
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.seeAllText}>See all</Text>
                          <ChevronRight size={16} color={colors.primary} />
                        </TouchableOpacity>
                      )}
                    </View>
                  }
                  renderItem={({ item: order }) => (
                    <BookingCard
                      order={order}
                      onPress={() => handleBookingPress(order.id)}
                    />
                  )}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <EmptyState
                    icon={Clock}
                    title="No active bookings"
                    description="You don't have any active bookings at the moment."
                  />
                </View>
              )}
            </View>
          )}

          {/* Upcoming Bookings Content */}
          {activeTab === "upcoming" && (
            <View style={styles.tabContent}>
              {Array.isArray(upcomingBookingsHome) &&
              upcomingBookingsHome.length > 0 ? (
                <FlatList
                  data={upcomingBookingsHome}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.verticalScrollContent}
                  scrollEnabled={false}
                  nestedScrollEnabled={true}
                  ListHeaderComponent={
                    <View style={styles.listHeaderRow}>
                      <Text style={styles.listHeaderTitle}>Upcoming Bookings</Text>
                      {upcomingBookings.length > 0 && (
                        <TouchableOpacity
                          style={styles.seeAllButton}
                          onPress={() => {
                            const parent = navigation.getParent();
                            if (parent) {
                              parent.navigate("SeeAllBookings", {
                                initialTab: "upcoming",
                              });
                            } else {
                              navigation.navigate("SeeAllBookings", {
                                initialTab: "upcoming",
                              });
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.seeAllText}>See all</Text>
                          <ChevronRight size={16} color={colors.primary} />
                        </TouchableOpacity>
                      )}
                    </View>
                  }
                  renderItem={({ item: booking }) => (
                    <BookingCard
                      order={booking}
                      onPress={() => handleBookingPress(booking.id)}
                    />
                  )}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <EmptyState
                    icon={AlertCircle}
                    title="No upcoming bookings"
                    description="Start your beach adventure by booking beanbags today!"
                  />
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const LoadingSkeleton = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={"dark-content"} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section Skeleton */}
        <View style={styles.header}>
          <Skeleton width="38%" height={isTablet ? 32 : 28} style={styles.skeletonHeaderTitle} />
          <Skeleton width="50%" height={20} style={styles.skeletonHeaderSubtitle} />
        </View>

        {/* Stats Cards Section Skeleton */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.statCardWrapper}>
                <Skeleton width="100%" height={100} style={styles.skeletonStatCard} />
              </View>
            ))}
          </View>
        </View>

        {/* Bookings Section Skeleton */}
        <View style={styles.section}>
          {/* Section Title Skeleton */}
          <View style={styles.sectionHeader}>
            <Skeleton width="40%" height={isTablet ? 32 : 28} style={styles.skeletonSectionTitle} />
          </View>

          {/* Tab Switcher Skeleton */}
          <View style={styles.tabSwitcherWrapper}>
            <Skeleton width="100%" height={50} style={styles.skeletonTabSwitcher} />
          </View>

          {/* Booking Content Skeleton */}
          <View style={styles.tabContent}>
            <Skeleton width="100%" height={220} style={styles.skeletonCard} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


export default HomeScreen;
