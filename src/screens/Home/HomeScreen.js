/**
 * Home Screen
 * User home screen matching web app exactly
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
  MapPin,
  Calendar,
  Plus,
  DollarSign,
  AlertCircle,
  ShoppingBag,
  Clock,
} from "lucide-react-native";
import { format } from "date-fns";
import { colors, fontSizes, spacing, borderRadius, shadows } from "../../theme";
import { selectUser, selectIsAuthenticated } from "../../redux/authSlice";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import StatCard from "../../components/StatCard";
import BookingCard from "../../components/BookingCard";
import EmptyState from "../../components/EmptyState";
import Skeleton from "../../components/Skeleton";
import { get } from "../../utils/api";
import { ordersEndpoints } from "../../utils/constants";
import { withOpacity } from "../../utils/colorHelper";

// Note: ordersEndpoints is imported from constants, matching web app structure

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const HomeScreen = ({ navigation }) => {
  // This is the NEW Home screen matching web app - src/screens/Home/HomeScreen.js
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [activeOrdersData, setActiveOrdersData] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("active"); // 'active' or 'upcoming'

  // Mock upcoming bookings (matching web app)
  const [upcomingBookings] = useState([
    {
      id: "BK001",
      location: "Sunny Beach, Miami",
      date: "2024-01-15",
      endDate: "2024-01-16",
      beanbags: 2,
      price: 89.99,
      status: "upcoming",
    },
    {
      id: "BK002",
      location: "Coral Shores, California",
      date: "2024-01-20",
      endDate: "2024-01-22",
      beanbags: 3,
      price: 249.99,
      status: "upcoming",
    },
    {
      id: "BK003",
      location: "Paradise Point, Hawaii",
      date: "2024-02-01",
      endDate: "2024-02-05",
      beanbags: 4,
      price: 399.99,
      status: "upcoming",
    },
  ]);

  const fetchActiveOrders = async () => {
    if (!isAuthenticated || !user) {
      setOrdersLoading(false);
      return;
    }

    try {
      setOrdersLoading(true);
      const response = await get(ordersEndpoints.active);
      console.log("Active orfers", response?.data);

      setActiveOrdersData(response);
    } catch (error) {
      console.error("Error fetching active orders:", error);
      setActiveOrdersData({ data: [] });
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveOrders();
  }, [isAuthenticated, user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActiveOrders();
    setRefreshing(false);
  };

  const handleBookingPress = (orderId) => {
    navigation.navigate("BookingDetails", { orderId });
  };

  const handleExtendPress = (orderId) => {
    navigation.navigate("ExtendBooking", { orderId });
  };

  const handleNewBooking = () => {
    navigation.navigate("Booking");
  };

  const activeOrders = Array.isArray(activeOrdersData?.data)
    ? activeOrdersData.data
    : [];
  const totalSpent = upcomingBookings.reduce(
    (sum, booking) => sum + (booking.price || 0),
    0
  );

  // Show loading skeleton only on initial load
  if (ordersLoading && !activeOrdersData) {
    return <LoadingSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container}>
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
          <View style={styles.headerText}>
            <Text style={styles.welcomeTitle}>
              Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Ready for another relaxing beach day?
            </Text>
          </View>
          <Button
            title="New Booking"
            onPress={handleNewBooking}
            icon={<Plus size={20} color={colors.primaryForeground} />}
            style={styles.newBookingButton}
          />
        </View>

        {/* Stats Cards Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCardWrapper}>
              <StatCard
                title="Active Bookings"
                value={activeOrders.length}
                icon={Clock}
                iconBgColor={withOpacity(colors.primary, 0.1)}
                iconColor={colors.primary}
              />
            </View>
            <View style={styles.statCardWrapper}>
              <StatCard
                title="Upcoming Bookings"
                value={upcomingBookings.length}
                icon={Calendar}
                iconBgColor={withOpacity("#3B82F6", 0.1)}
                iconColor="#3B82F6"
              />
            </View>
            <View style={styles.statCardWrapper}>
              <StatCard
                title="Total Spent"
                value={`$${totalSpent.toFixed(2)}`}
                icon={DollarSign}
                iconBgColor={withOpacity("#10B981", 0.1)}
                iconColor="#10B981"
              />
            </View>
            <View style={styles.statCardWrapper}>
              <StatCard
                title="Total Beanbags"
                value={1}
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
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "active" && styles.tabActive]}
              onPress={() => setActiveTab("active")}
              activeOpacity={0.7}
            >
              <Clock
                size={18}
                color={
                  activeTab === "active"
                    ? colors.primary
                    : colors.mutedForeground
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "active" && styles.tabTextActive,
                ]}
              >
                Active
              </Text>
              {activeOrders.length > 0 && (
                <View
                  style={[
                    styles.tabBadge,
                    activeTab === "active" && styles.tabBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabBadgeText,
                      activeTab === "active" && styles.tabBadgeTextActive,
                    ]}
                  >
                    {activeOrders.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "upcoming" && styles.tabActive]}
              onPress={() => setActiveTab("upcoming")}
              activeOpacity={0.7}
            >
              <Calendar
                size={18}
                color={
                  activeTab === "upcoming"
                    ? colors.primary
                    : colors.mutedForeground
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "upcoming" && styles.tabTextActive,
                ]}
              >
                Upcoming
              </Text>
              {upcomingBookings.length > 0 && (
                <View
                  style={[
                    styles.tabBadge,
                    activeTab === "upcoming" && styles.tabBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabBadgeText,
                      activeTab === "upcoming" && styles.tabBadgeTextActive,
                    ]}
                  >
                    {upcomingBookings.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Active Bookings Content */}
          {activeTab === "active" && (
            <View style={styles.tabContent}>
              {ordersLoading ? (
                <View style={styles.skeletonGrid}>
                  {[1, 2].map((i) => (
                    <Skeleton
                      key={i}
                      width="100%"
                      height={220}
                      style={styles.skeletonCard}
                    />
                  ))}
                </View>
              ) : activeOrders.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContent}
                >
                  {activeOrders.map((order) => (
                    <View key={order.id} style={styles.horizontalCard}>
                      <BookingCard
                        order={order}
                        onPress={() => handleBookingPress(order.id)}
                        onExtendPress={() => handleExtendPress(order.id)}
                      />
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyContainer}>
                  <EmptyState
                    icon={Clock}
                    title="No active bookings"
                    description="You don't have any active bookings at the moment."
                    buttonText="Book Now"
                    onButtonPress={handleNewBooking}
                  />
                </View>
              )}
            </View>
          )}

          {/* Upcoming Bookings Content */}
          {activeTab === "upcoming" && (
            <View style={styles.tabContent}>
              {upcomingBookings.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContent}
                >
                  {upcomingBookings.map((booking) => (
                    <View key={booking.id} style={styles.horizontalCard}>
                      <View style={styles.upcomingCard}>
                        <View style={styles.upcomingHeader}>
                          <View style={styles.upcomingHeaderLeft}>
                            <Text style={styles.upcomingId}>
                              Booking #{booking.id}
                            </Text>
                            <Text style={styles.upcomingLocation}>
                              {booking.location}
                            </Text>
                          </View>
                          <Badge
                            style={[
                              styles.upcomingBadge,
                              {
                                backgroundColor: withOpacity(
                                  colors.primary,
                                  0.1
                                ),
                              },
                            ]}
                            textStyle={{ color: colors.primary }}
                          >
                            Upcoming
                          </Badge>
                        </View>

                        <View style={styles.upcomingDetails}>
                          <View style={styles.upcomingDetailRow}>
                            <Calendar size={18} color={colors.primary} />
                            <Text style={styles.upcomingDetailText}>
                              {format(new Date(booking.date), "MMM d, yyyy")}
                            </Text>
                          </View>

                          <View style={styles.upcomingDetailRow}>
                            <MapPin size={18} color={colors.primary} />
                            <Text style={styles.upcomingDetailText}>
                              {booking.beanbags} Beanbags
                            </Text>
                          </View>

                          <View style={styles.upcomingDetailRow}>
                            <DollarSign size={18} color={colors.primary} />
                            <Text
                              style={[
                                styles.upcomingDetailText,
                                styles.upcomingPrice,
                              ]}
                            >
                              ${booking.price.toFixed(2)}
                            </Text>
                          </View>
                        </View>

                        <TouchableOpacity
                          style={styles.upcomingButton}
                          onPress={() => handleBookingPress(booking.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.upcomingButtonText}>
                            View Details
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyContainer}>
                  <EmptyState
                    icon={AlertCircle}
                    title="No upcoming bookings"
                    description="Start your beach adventure by booking beanbags today!"
                    buttonText="Book Now"
                    onButtonPress={handleNewBooking}
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Skeleton width="60%" height={32} style={styles.skeletonTitle} />
        <Skeleton width="40%" height={16} style={styles.skeletonSubtitle} />
        <View style={styles.skeletonStats}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              width="100%"
              height={128}
              style={styles.skeletonStatCard}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  headerText: {
    marginBottom: spacing.xs,
  },
  welcomeTitle: {
    fontSize: isTablet ? fontSizes.displaySmall : fontSizes.h1,
    fontWeight: "700",
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: fontSizes.body,
    color: colors.mutedForeground,
  },
  newBookingButton: {
    alignSelf: isTablet ? "flex-start" : "stretch",
    marginTop: spacing.sm,
  },
  statsSection: {
    marginBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCardWrapper: {
    width: isTablet 
      ? (width - spacing.md * 5) / 4  // 4 cards per row on tablet
      : (width - spacing.md * 3) / 2, // 2 cards per row on mobile
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: isTablet ? fontSizes.displaySmall : fontSizes.h1,
    fontWeight: "700",
    color: colors.foreground,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.muted + "40",
    borderRadius: borderRadius.medium,
    padding: spacing.xs,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.small,
    backgroundColor: "transparent",
  },
  tabActive: {
    backgroundColor: colors.background,
    ...shadows.small,
  },
  tabText: {
    fontSize: fontSizes.body,
    fontWeight: "500",
    color: colors.mutedForeground,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },
  tabBadgeActive: {
    backgroundColor: colors.primary,
  },
  tabBadgeText: {
    fontSize: fontSizes.xs,
    fontWeight: "600",
    color: colors.mutedForeground,
  },
  tabBadgeTextActive: {
    color: colors.textWhite,
  },
  tabContent: {
    minHeight: 200,
  },
  horizontalScrollContent: {
    paddingRight: spacing.md,
    gap: spacing.md,
  },
  horizontalCard: {
    width: isTablet ? 380 : width - spacing.md * 3,
    marginRight: spacing.md,
  },
  bookingsGrid: {
    gap: spacing.md,
  },
  bookingsGridTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  emptyContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xlarge,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    padding: spacing.xl,
  },
  upcomingCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xlarge,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.small,
    height: "100%",
  },
  upcomingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  upcomingHeaderLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  upcomingId: {
    fontSize: fontSizes.bodySmall,
    color: colors.mutedForeground,
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  upcomingLocation: {
    fontSize: fontSizes.h3,
    fontWeight: "700",
    color: colors.foreground,
  },
  upcomingBadge: {
    // Badge styling handled inline with backgroundColor
  },
  upcomingDetails: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  upcomingDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  upcomingDetailText: {
    fontSize: fontSizes.bodySmall,
    color: colors.mutedForeground,
  },
  upcomingPrice: {
    fontWeight: "600",
    color: colors.foreground,
  },
  upcomingButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary + "20",
    borderRadius: borderRadius.medium,
    alignItems: "center",
  },
  upcomingButtonText: {
    fontSize: fontSizes.bodySmall,
    fontWeight: "500",
    color: colors.primary,
  },
  skeletonGrid: {
    gap: spacing.md,
  },
  skeletonCard: {
    marginBottom: spacing.md,
  },
  skeletonTitle: {
    marginBottom: spacing.md,
  },
  skeletonSubtitle: {
    marginBottom: spacing.xl,
  },
  skeletonStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  skeletonStatCard: {
    flex: isTablet ? "0 0 48%" : 1,
    marginBottom: spacing.md,
  },
});

export default HomeScreen;
