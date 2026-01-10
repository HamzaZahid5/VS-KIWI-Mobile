/**
 * Booking History Screen
 * Shows user's booking history with filtering and search
 * Matches web app: client/src/pages/User/History/index.tsx
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from "react-native";
import {
  ChevronLeft,
  Search,
  Filter,
  X,
  Package,
  MapPin,
  Clock,
  History as HistoryIcon,
  ChevronRight,
} from "lucide-react-native";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { colors, spacing, fontSizes, borderRadius, shadows } from "../../theme";
import { selectUser } from "../../redux/authSlice";
import { get } from "../../utils/api";
import { ordersEndpoints } from "../../utils/constants";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Skeleton from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";
import { withOpacity } from "../../utils/colorHelper";

// Helper function to get status badge
const getStatusBadge = (status, paymentStatus) => {
  switch (status) {
    case "new":
      if (paymentStatus === "pending") {
        return <Badge variant="warning">Pending</Badge>;
      } else if (paymentStatus === "paid") {
        return <Badge variant="outline">Confirmed</Badge>;
      }
      return <Badge variant="secondary">Pending</Badge>;
    case "assigned":
      return (
        <View
          style={[
            styles.customBadge,
            { backgroundColor: withOpacity("#3B82F6", 0.1) },
          ]}
        >
          <Text style={[styles.customBadgeText, { color: "#3B82F6" }]}>
            On the way
          </Text>
        </View>
      );
    case "delivered":
      return (
        <View
          style={[
            styles.customBadge,
            { backgroundColor: withOpacity(colors.primary, 0.1) },
          ]}
        >
          <Text
            style={[styles.customBadgeText, { color: colors.primary }]}
          >
            Active
          </Text>
        </View>
      );
    case "collected":
      return <Badge variant="default">Completed</Badge>;
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
    case "expired":
      return <Badge variant="destructive">Expired</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

// Helper function to get payment status badge
const getPaymentStatusBadge = (paymentStatus) => {
  switch (paymentStatus) {
    case "pending":
      return <Badge variant="warning">Pending</Badge>;
    case "paid":
      return <Badge variant="default">Paid</Badge>;
    case "failed":
      return <Badge variant="destructive">Failed</Badge>;
    case "refunded":
      return <Badge variant="secondary">Refunded</Badge>;
    default:
      return <Badge variant="secondary">{paymentStatus}</Badge>;
  }
};

const BookingHistoryScreen = ({ navigation }) => {
  const user = useSelector(selectUser);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [bookingTypeFilter, setBookingTypeFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [beachFilter, setBeachFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await get(ordersEndpoints.myOrders);
      const ordersData = response?.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      Alert.alert("Error", "Failed to load booking history. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
  };

  // Extract unique beaches from orders
  const uniqueBeaches = useMemo(() => {
    const beachMap = new Map();
    orders.forEach((order) => {
      if (order.beach && order.beach.id) {
        beachMap.set(order.beach.id, order.beach);
      }
    });
    return Array.from(beachMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [orders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    return orders.filter((order) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.beach?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.beach?.city?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      // Payment status filter
      const matchesPaymentStatus =
        paymentStatusFilter === "all" ||
        order.paymentStatus === paymentStatusFilter;

      // Booking type filter
      const matchesBookingType =
        bookingTypeFilter === "all" || order.bookingType === bookingTypeFilter;

      // Payment method filter
      const matchesPaymentMethod =
        paymentMethodFilter === "all" ||
        order.paymentMethod === paymentMethodFilter;

      // Beach filter
      const matchesBeach =
        beachFilter === "all" || order.beach?.id === beachFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPaymentStatus &&
        matchesBookingType &&
        matchesPaymentMethod &&
        matchesBeach
      );
    });
  }, [
    orders,
    searchTerm,
    statusFilter,
    paymentStatusFilter,
    bookingTypeFilter,
    paymentMethodFilter,
    beachFilter,
  ]);

  const hasActiveFilters =
    statusFilter !== "all" ||
    paymentStatusFilter !== "all" ||
    bookingTypeFilter !== "all" ||
    paymentMethodFilter !== "all" ||
    beachFilter !== "all";

  const clearAllFilters = () => {
    setStatusFilter("all");
    setPaymentStatusFilter("all");
    setBookingTypeFilter("all");
    setPaymentMethodFilter("all");
    setBeachFilter("all");
    setSearchTerm("");
  };

  const handleOrderPress = (orderId) => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate("BookingDetails", { orderId, fromScreen: "BookingHistory" });
    } else {
      navigation.navigate("BookingDetails", { orderId, fromScreen: "BookingHistory" });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            const parent = navigation.getParent();
            if (parent) {
              parent.navigate("MainTabs", { screen: "ProfileTab" });
            } else {
              navigation.goBack();
            }
          }}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking History</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={colors.mutedForeground} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by Order ID, Beach, or City..."
              placeholderTextColor={colors.mutedForeground}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
            activeOpacity={0.7}
          >
            <Filter size={20} color={colors.foreground} />
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>
        </View>

        {/* Filters Panel */}
        {showFilters && (
          <Card style={styles.filtersCard}>
            <View style={styles.filtersHeader}>
              <Text style={styles.filtersTitle}>Filters</Text>
              <View style={styles.filtersHeaderActions}>
                {hasActiveFilters && (
                  <TouchableOpacity
                    style={styles.clearFiltersButton}
                    onPress={clearAllFilters}
                    activeOpacity={0.7}
                  >
                    <X size={16} color={colors.primary} />
                    <Text style={styles.clearFiltersText}>Clear All</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.closeFiltersButton}
                  onPress={() => setShowFilters(false)}
                  activeOpacity={0.7}
                >
                  <X size={20} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Filter Options */}
            <View style={styles.filterOptions}>
              {/* Beach Filter */}
              <View style={styles.filterOption}>
                <Text style={styles.filterLabel}>Beach</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filterScroll}
                >
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      beachFilter === "all" && styles.filterChipActive,
                    ]}
                    onPress={() => setBeachFilter("all")}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        beachFilter === "all" && styles.filterChipTextActive,
                      ]}
                    >
                      All
                    </Text>
                  </TouchableOpacity>
                  {uniqueBeaches.map((beach) => (
                    <TouchableOpacity
                      key={beach.id}
                      style={[
                        styles.filterChip,
                        beachFilter === beach.id && styles.filterChipActive,
                      ]}
                      onPress={() => setBeachFilter(beach.id)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          beachFilter === beach.id && styles.filterChipTextActive,
                        ]}
                      >
                        {beach.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Status Filter */}
              <View style={styles.filterOption}>
                <Text style={styles.filterLabel}>Status</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filterScroll}
                >
                  {["all", "new", "assigned", "delivered", "collected", "cancelled", "expired"].map(
                    (status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.filterChip,
                          statusFilter === status && styles.filterChipActive,
                        ]}
                        onPress={() => setStatusFilter(status)}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            statusFilter === status &&
                              styles.filterChipTextActive,
                          ]}
                        >
                          {status === "all"
                            ? "All"
                            : status === "delivered"
                            ? "Active"
                            : status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </ScrollView>
              </View>

              {/* Payment Status Filter */}
              <View style={styles.filterOption}>
                <Text style={styles.filterLabel}>Payment Status</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filterScroll}
                >
                  {["all", "pending", "paid", "failed", "refunded"].map(
                    (paymentStatus) => (
                      <TouchableOpacity
                        key={paymentStatus}
                        style={[
                          styles.filterChip,
                          paymentStatusFilter === paymentStatus &&
                            styles.filterChipActive,
                        ]}
                        onPress={() => setPaymentStatusFilter(paymentStatus)}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            paymentStatusFilter === paymentStatus &&
                              styles.filterChipTextActive,
                          ]}
                        >
                          {paymentStatus === "all"
                            ? "All"
                            : paymentStatus.charAt(0).toUpperCase() +
                              paymentStatus.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </ScrollView>
              </View>

              {/* Booking Type Filter */}
              <View style={styles.filterOption}>
                <Text style={styles.filterLabel}>Booking Type</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filterScroll}
                >
                  {["all", "order_now", "pre_book"].map((bookingType) => (
                    <TouchableOpacity
                      key={bookingType}
                      style={[
                        styles.filterChip,
                        bookingTypeFilter === bookingType &&
                          styles.filterChipActive,
                      ]}
                      onPress={() => setBookingTypeFilter(bookingType)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          bookingTypeFilter === bookingType &&
                            styles.filterChipTextActive,
                        ]}
                      >
                        {bookingType === "all"
                          ? "All"
                          : bookingType === "order_now"
                          ? "Instant"
                          : "Pre-booked"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Payment Method Filter */}
              <View style={styles.filterOption}>
                <Text style={styles.filterLabel}>Payment Method</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filterScroll}
                >
                  {["all", "stripe", "cod"].map((paymentMethod) => (
                    <TouchableOpacity
                      key={paymentMethod}
                      style={[
                        styles.filterChip,
                        paymentMethodFilter === paymentMethod &&
                          styles.filterChipActive,
                      ]}
                      onPress={() => setPaymentMethodFilter(paymentMethod)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          paymentMethodFilter === paymentMethod &&
                            styles.filterChipTextActive,
                        ]}
                      >
                        {paymentMethod === "all"
                          ? "All"
                          : paymentMethod === "stripe"
                          ? "Card"
                          : "COD"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Card>
        )}

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <View style={styles.ordersList}>
            {filteredOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                onPress={() => handleOrderPress(order.id)}
                activeOpacity={0.7}
              >
                <Card style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <View style={styles.orderIdContainer}>
                      <View style={styles.orderIcon}>
                        <Package size={16} color={colors.primary} />
                      </View>
                      <Text style={styles.orderId}>
                        #{order.id?.slice(0, 8) || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.orderStatuses}>
                      {getStatusBadge(order.status, order.paymentStatus)}
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </View>
                  </View>

                  <View style={styles.orderDetails}>
                    {/* Beach */}
                    <View style={styles.orderDetailRow}>
                      <MapPin size={16} color={colors.mutedForeground} />
                      <Text style={styles.orderDetailText} numberOfLines={1}>
                        {order.beach?.name || "N/A"}, {order.beach?.city || "N/A"}
                      </Text>
                    </View>

                    {/* Items */}
                    {order.items && order.items.length > 0 && (
                      <View style={styles.orderDetailRow}>
                        <Package size={16} color={colors.mutedForeground} />
                        <Text style={styles.orderDetailText}>
                          {order.items
                            .map((item) => `${item.quantity}x ${item.size}`)
                            .join(", ")}
                        </Text>
                      </View>
                    )}

                    {/* Booking Type & Duration */}
                    <View style={styles.orderDetailRow}>
                      <Clock size={16} color={colors.mutedForeground} />
                      <Badge variant="outline" style={styles.bookingTypeBadge}>
                        {order.bookingType === "order_now"
                          ? "Instant"
                          : "Pre-booked"}
                      </Badge>
                      <Text style={styles.orderDetailText}>
                        {order.durationHours} hour
                        {order.durationHours > 1 ? "s" : ""}
                      </Text>
                    </View>

                    {/* Payment Method */}
                    <View style={styles.orderDetailRow}>
                      <Text style={styles.orderDetailText}>
                        Payment: {order.paymentMethod === "stripe" ? "Card" : "COD"}
                      </Text>
                    </View>

                    {/* Amount */}
                    <View style={styles.orderAmountRow}>
                      <Text style={styles.orderAmountLabel}>Amount:</Text>
                      <Text style={styles.orderAmount}>
                        AED {parseFloat(order.totalPrice || 0).toFixed(2)}
                      </Text>
                      {order.discountAmount &&
                        parseFloat(order.discountAmount) > 0 && (
                          <Text style={styles.orderDiscount}>
                            -AED {parseFloat(order.discountAmount).toFixed(2)}
                          </Text>
                        )}
                    </View>
                  </View>

                  <View style={styles.orderActions}>
                    <Button
                      title="View Details"
                      variant="outline"
                      onPress={() => handleOrderPress(order.id)}
                      icon={<ChevronRight size={16} color={colors.primary} />}
                      style={styles.viewDetailsButton}
                    />
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        ) : orders.length > 0 && filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={48} color={colors.mutedForeground} />
            <Text style={styles.emptyStateTitle}>
              No bookings match your filters
            </Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or filter criteria
            </Text>
            {hasActiveFilters && (
              <Button
                title="Clear All Filters"
                variant="outline"
                onPress={clearAllFilters}
                style={styles.clearFiltersButtonLarge}
              />
            )}
          </View>
        ) : (
          <EmptyState
            icon={HistoryIcon}
            title="No bookings yet"
            description="Your booking history will appear here"
            buttonText="Make Your First Booking"
            onButtonPress={() => {
              const parent = navigation.getParent();
              if (parent) {
                parent.navigate("MainTabs", { screen: "NewBookingTab" });
              } else {
                navigation.navigate("MainTabs", { screen: "NewBookingTab" });
              }
            }}
          />
        )}
      </ScrollView>
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
    height: 150,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  searchContainer: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.medium,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSizes.body,
    color: colors.foreground,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.muted,
    borderRadius: borderRadius.medium,
  },
  filterButtonText: {
    fontSize: fontSizes.body,
    fontWeight: "600",
    color: colors.foreground,
  },
  filtersCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  filtersHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  filtersTitle: {
    fontSize: fontSizes.base,
    fontWeight: "600",
    color: colors.foreground,
  },
  filtersHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  clearFiltersButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  clearFiltersText: {
    fontSize: fontSizes.sm,
    fontWeight: "500",
    color: colors.primary,
  },
  closeFiltersButton: {
    padding: spacing.xs,
  },
  filterOptions: {
    gap: spacing.md,
  },
  filterOption: {
    gap: spacing.sm,
  },
  filterLabel: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.mutedForeground,
  },
  filterScroll: {
    maxHeight: 50,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.muted,
    borderRadius: borderRadius.large,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: fontSizes.sm,
    fontWeight: "500",
    color: colors.foreground,
  },
  filterChipTextActive: {
    color: colors.primaryForeground,
  },
  ordersList: {
    gap: spacing.md,
  },
  orderCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  orderIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  orderIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.small,
    backgroundColor: withOpacity(colors.primary, 0.1),
    alignItems: "center",
    justifyContent: "center",
  },
  orderId: {
    fontSize: fontSizes.base,
    fontWeight: "600",
    fontFamily: "monospace",
    color: colors.foreground,
  },
  orderStatuses: {
    flexDirection: "row",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  customBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.small,
  },
  customBadgeText: {
    fontSize: fontSizes.xs,
    fontWeight: "600",
  },
  orderDetails: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  orderDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  orderDetailText: {
    fontSize: fontSizes.body,
    color: colors.foreground,
    flex: 1,
  },
  bookingTypeBadge: {
    marginRight: spacing.xs,
  },
  orderAmountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  orderAmountLabel: {
    fontSize: fontSizes.body,
    color: colors.mutedForeground,
  },
  orderAmount: {
    fontSize: fontSizes.h3,
    fontWeight: "700",
    color: colors.foreground,
  },
  orderDiscount: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.primary,
  },
  orderActions: {
    marginTop: spacing.sm,
  },
  viewDetailsButton: {
    alignSelf: "flex-start",
  },
  emptyState: {
    alignItems: "center",
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyStateTitle: {
    fontSize: fontSizes.h3,
    fontWeight: "600",
    color: colors.foreground,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: fontSizes.body,
    color: colors.mutedForeground,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  clearFiltersButtonLarge: {
    marginTop: spacing.md,
  },
});

export default BookingHistoryScreen;

