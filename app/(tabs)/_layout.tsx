import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Icon from 'react-native-vector-icons/Ionicons'

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Icon size={25} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="AllLeases"
        options={{
          title: 'Leases',
          tabBarIcon: ({ color }) => <Icon size={25} name="car" color={color} />,
        }}
      />
      <Tabs.Screen
        name="FavouriteCars"
        options={{
          title: 'Favourite',
          tabBarIcon: ({ color }) => <Icon size={25} name="heart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Setting"
        options={{
          title: 'Setting',
          tabBarIcon: ({ color }) => <Icon size={25} name="settings" color={color} />,
        }}
      />
    </Tabs>
  );
}
