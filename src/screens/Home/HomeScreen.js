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
          <View style={[styles.statsGrid, isTablet && styles.statsGridTablet]}>
            <View style={isTablet && styles.statsGridTabletItem}>
              <StatCard
                title="Active Bookings"
                value={activeOrders.length}
                icon={Clock}
                iconBgColor={withOpacity(colors.primary, 0.1)}
                iconColor={colors.primary}
              />
            </View>
            <View style={isTablet && styles.statsGridTabletItem}>
              <StatCard
                title="Upcoming Bookings"
                value={upcomingBookings.length}
                icon={Calendar}
                iconBgColor={withOpacity("#3B82F6", 0.1)}
                iconColor="#3B82F6"
              />
            </View>
            <View style={isTablet && styles.statsGridTabletItem}>
              <StatCard
                title="Total Spent"
                value={`$${totalSpent.toFixed(2)}`}
                icon={DollarSign}
                iconBgColor={withOpacity("#10B981", 0.1)}
                iconColor="#10B981"
              />
            </View>
            <View style={isTablet && styles.statsGridTabletItem}>
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

        {/* Active Bookings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Bookings</Text>
            {activeOrders.length > 0 && (
              <Badge variant="secondary">{activeOrders.length} Active</Badge>
            )}
          </View>

          {ordersLoading ? (
            <View style={styles.skeletonGrid}>
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  width="100%"
                  height={256}
                  style={styles.skeletonCard}
                />
              ))}
            </View>
          ) : activeOrders.length > 0 ? (
            <View
              style={[
                styles.bookingsGrid,
                isTablet && styles.bookingsGridTablet,
              ]}
            >
              {activeOrders.map((order) => (
                <BookingCard
                  key={order.id}
                  order={order}
                  onPress={() => handleBookingPress(order.id)}
                  onExtendPress={() => handleExtendPress(order.id)}
                />
              ))}
            </View>
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

        {/* Upcoming Bookings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Bookings</Text>
          </View>

          {upcomingBookings.length > 0 ? (
            <View
              style={[
                styles.bookingsGrid,
                isTablet && styles.bookingsGridTablet,
              ]}
            >
              {upcomingBookings.map((booking) => (
                <View key={booking.id} style={styles.upcomingCard}>
                  <View style={styles.upcomingHeader}>
                    <View>
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
                        { backgroundColor: withOpacity(colors.primary, 0.1) },
                      ]}
                      textStyle={{ color: colors.primary }}
                    >
                      Upcoming
                    </Badge>
                  </View>

                  <View style={styles.upcomingDetails}>
                    <View style={styles.upcomingDetailRow}>
                      <Calendar size={20} color={colors.primary} />
                      <Text style={styles.upcomingDetailText}>
                        {format(new Date(booking.date), "MMM d, yyyy")}
                      </Text>
                    </View>

                    <View style={styles.upcomingDetailRow}>
                      <MapPin size={20} color={colors.primary} />
                      <Text style={styles.upcomingDetailText}>
                        {booking.beanbags} Beanbags
                      </Text>
                    </View>

                    <View style={styles.upcomingDetailRow}>
                      <DollarSign size={20} color={colors.primary} />
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
                    <Text style={styles.upcomingButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
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
    gap: spacing.md,
  },
  statsGridTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statsGridTabletItem: {
    width: isTablet ? "48%" : "100%",
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
    marginBottom: spacing.md,
    ...shadows.small,
  },
  upcomingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
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
