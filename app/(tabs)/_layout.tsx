import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Icon from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
     <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          height: 60 + insets.bottom, 
          paddingBottom: insets.bottom,
          paddingTop: 8,
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
        tabBarLabelStyle: { fontSize: 10, marginBottom: 0 },
        tabBarIconStyle: { width: 25, height: 25 },
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Icon size={25} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="AllLeases"
        options={{
          title: "Leases",
          tabBarIcon: ({ color }) => (
            <Icon size={25} name="stopwatch" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="FavouriteCars"
        options={{
          title: "Favourite",
          tabBarIcon: ({ color }) => (
            <Icon size={25} name="heart" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Setting"
        options={{
          title: "Setting",
          tabBarIcon: ({ color }) => (
            <Icon size={25} name="settings" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
