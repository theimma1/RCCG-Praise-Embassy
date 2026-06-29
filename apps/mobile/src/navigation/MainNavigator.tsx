import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "@/screens/home/HomeScreen";
import MemberDirectoryScreen from "@/screens/members/MemberDirectoryScreen";
import AttendanceCheckInScreen from "@/screens/attendance/AttendanceCheckInScreen";
import ProfileScreen from "@/screens/profile/ProfileScreen";
import type { MainTabParamList } from "@/types/navigation";

const Tab = createBottomTabNavigator<MainTabParamList>();

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

const tabIcons: Record<keyof MainTabParamList, { active: IoniconsName; inactive: IoniconsName }> = {
  Home: { active: "home", inactive: "home-outline" },
  Members: { active: "people", inactive: "people-outline" },
  Attendance: { active: "checkmark-circle", inactive: "checkmark-circle-outline" },
  Profile: { active: "person", inactive: "person-outline" },
};

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: "#1a237e" },
        headerTintColor: "#ffffff",
        headerTitleStyle: { fontWeight: "700" },
        tabBarActiveTintColor: "#1a237e",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          borderTopColor: "#f1f5f9",
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginBottom: 4 },
        tabBarIcon: ({ focused, color, size }) => {
          const icon = tabIcons[route.name as keyof MainTabParamList];
          return (
            <Ionicons
              name={focused ? icon.active : icon.inactive}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Dashboard" }} />
      <Tab.Screen name="Members" component={MemberDirectoryScreen} options={{ title: "Members" }} />
      <Tab.Screen name="Attendance" component={AttendanceCheckInScreen} options={{ title: "Check In" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
    </Tab.Navigator>
  );
}
