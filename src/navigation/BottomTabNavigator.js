/**
 * Bottom Tab Navigator
 * Main navigation for authenticated users with Home, New Booking, and Profile tabs
 */

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { TouchableOpacity } from "react-native";
import { Home, Plus, User } from "lucide-react-native";
import { colors, fontSizes } from "../theme";

// Import screens
import HomeScreen from "../screens/Home/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import NewBookingTabPlaceholder from "./NewBookingTabPlaceholder";

const Tab = createBottomTabNavigator();

/**
 * Bottom Tab Navigator component
 * Provides main navigation between Home, New Booking, and Profile
 */
const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.primaryMuted,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          bottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: fontSizes.xs,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="NewBookingTab"
        component={NewBookingTabPlaceholder}
        options={({ navigation: nav }) => ({
          tabBarLabel: "New Booking",
          tabBarIcon: ({ color, size }) => <Plus size={size} color={color} />,
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => {
                // Navigate to NewBooking stack screen (parent navigator)
                const parent = nav.getParent();
                if (parent) {
                  parent.navigate("NewBooking");
                } else {
                  nav.navigate("NewBooking");
                }
              }}
            />
          ),
        })}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
