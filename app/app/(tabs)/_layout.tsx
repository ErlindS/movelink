/**
 * @implements FA1.1
 */
import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { AuroraBackground } from '@/components/AuroraBackground';
import { SideNav } from '@/components/side_nav/SideNav';

export default function TabLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <AuroraBackground />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="history" />
        <Tabs.Screen name="settings" />
      </Tabs>
      <SideNav />
    </View>
  );
}
