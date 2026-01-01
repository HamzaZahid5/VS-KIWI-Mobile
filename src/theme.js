/**
 * Theme configuration for Kiwi Rentals app
 * Colors and styles matching the Kiwi Rentals web app design
 */

export const colors = {
  // Primary brand colors - matching web app (HSL: 135.93 100% 22.16%)
  // primary: 'hsl(135.93, 100%, 22.16%)', // Green primary color from web app
  primary: "#00711e", // Green primary color from web app

  primaryDark: "hsl(135.93, 100%, 18%)",
  primaryLight: "hsl(135.93, 100%, 26%)",
  primaryForeground: "#FFFFFF",

  // Secondary colors - matching web app
  secondary: "hsl(210, 25%, 7.8431%)", // Dark text color used as secondary
  secondaryForeground: "#FFFFFF",

  // Background colors - matching web app
  background: "#FFFFFF", // Light mode: hsl(0, 0%, 100%)
  backgroundDark: "#000000", // Dark mode: hsl(0, 0%, 0%)
  backgroundLight: "#F8F9FA",
  card: "hsl(180, 6.6667%, 97.0588%)", // Light mode card
  cardDark: "hsl(228, 9.8039%, 10%)", // Dark mode card

  // Text colors - matching web app
  foreground: "hsl(210, 25%, 7.8431%)", // Light mode text
  foregroundDark: "hsl(200, 6.6667%, 91.1765%)", // Dark mode text
  text: "#2C3E50",
  textLight: "#7F8C8D",
  textDark: "#1A1A1A",
  textWhite: "#FFFFFF",
  mutedForeground: "hsl(210, 25%, 7.8431%)", // Light mode muted
  mutedForegroundDark: "hsl(210, 3.3898%, 46.2745%)", // Dark mode muted
  textMuted: "#7F8C8D",

  // Muted colors
  muted: "hsl(240, 1.9608%, 90%)", // Light mode
  mutedDark: "hsl(0, 0%, 9.4118%)", // Dark mode

  // Input colors
  input: "hsl(200, 23.0769%, 92%)", // Light mode
  inputDark: "hsl(207.6923, 27.6596%, 18.4314%)", // Dark mode

  // Border colors
  border: "hsl(201.4286, 30.4348%, 90.9804%)", // Light mode
  borderDark: "hsl(210, 5.2632%, 14.902%)", // Dark mode
  borderLight: "#F0F0F0",
  divider: "#E8E8E8",

  // Status colors
  success: "#27AE60",
  error: "hsl(356.3033, 90.5579%, 54.3137%)", // Destructive color from web app
  warning: "#F39C12",
  info: "#3498DB",
  destructive: "hsl(356.3033, 90.5579%, 54.3137%)",
  destructiveForeground: "#FFFFFF",

  // Shadow colors
  shadow: "rgba(0, 0, 0, 0.1)",
  shadowDark: "rgba(0, 0, 0, 0.2)",

  primaryHover: "#1f8a3a", // buttons hover / active
  primarySoft: "#4fb36d", // secondary actions
  primaryMuted: "#d6f0df",
};

export const fontSizes = {
  // Display sizes
  display: 32,
  displaySmall: 28,

  // Heading sizes (matching Tailwind)
  "3xl": 30, // text-3xl
  "2xl": 24, // text-2xl
  xl: 20, // text-xl
  lg: 18, // text-lg
  base: 16, // text-base
  sm: 14, // text-sm
  xs: 12, // text-xs

  // Legacy sizes (for backward compatibility)
  h1: 24,
  h2: 20,
  h3: 18,
  h4: 16,
  body: 16,
  bodySmall: 14,
  bodyLarge: 18,
  caption: 12,
  label: 14,
  button: 16,
};

export const fontWeights = {
  light: "300",
  regular: "400",
  medium: "500",
  semiBold: "600",
  bold: "700",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xlarge: 16,
  round: 9999,
};

export const shadows = {
  small: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  large: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

// Default theme object
const theme = {
  colors,
  fontSizes,
  fontWeights,
  spacing,
  borderRadius,
  shadows,
};

export default theme;
