import { StyleSheet, Dimensions } from "react-native";
import { colors, fontSizes, spacing, borderRadius, shadows } from "../../theme";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
    backgroundColor: colors.primaryMuted,
    marginHorizontal: -16,
    paddingHorizontal: 15,
    alignItems: "center",
    borderColor: colors.primary,
    borderWidth: 1,
    flexDirection: "row",
    paddingVertical: 10,
  },
  headerText: {},
  welcomeTitle: {
    fontSize: isTablet ? fontSizes.displaySmall : fontSizes.h1,
    fontWeight: "700",
    color: colors.foreground,
    width: "38%",
    paddingLeft: 5,
  },
  welcomeSubtitle: {
    fontSize: fontSizes.h4,
    color: colors.mutedForeground,
    textAlign: "center",
    fontWeight: "700",
    textTransform: "capitalize",
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
      ? (width - spacing.md * 5) / 4 // 4 cards per row on tablet
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
  tabSwitcherWrapper: {
    marginBottom: spacing.lg,
  },
  listHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  listHeaderTitle: {
    fontSize: fontSizes.h3,
    fontWeight: "700",
    color: colors.foreground,
    flex: 1,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  seeAllText: {
    fontSize: fontSizes.body,
    fontWeight: "600",
    color: colors.primary,
  },
  tabContent: {
    minHeight: 200,
  },
  verticalScrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.md,
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
  skeletonHeaderTitle: {
    paddingLeft: 5,
  },
  skeletonHeaderSubtitle: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  skeletonStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  skeletonStatCard: {
    borderRadius: borderRadius.large,
  },
  skeletonSectionTitle: {},
  skeletonTabSwitcher: {
    borderRadius: borderRadius.medium,
  },
});

