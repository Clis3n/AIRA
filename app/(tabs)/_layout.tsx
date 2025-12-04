import React from 'react';
import { Tabs } from 'expo-router';
import { Map, Bookmark, User, Search } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const BASE_TAB_HEIGHT = 60; 

  const getIconStyle = (focused: boolean) => ({
    backgroundColor: focused ? Colors.light.primary : 'transparent',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center' as 'center',
    justifyContent: 'center' as 'center',
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#A1A1AA',
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 20, 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: BASE_TAB_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins_500Medium',
          fontSize: 10,
          marginTop: 4,
          color: Colors.light.text
        },
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Lokasi',
          tabBarIcon: ({ focused }) => (
            <View style={getIconStyle(focused)}>
              <Map size={24} color={focused ? '#FFF' : '#9CA3AF'} strokeWidth={2} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: 'Cari',
          tabBarIcon: ({ focused }) => (
            <View style={getIconStyle(focused)}>
              <Search size={24} color={focused ? '#FFF' : '#9CA3AF'} strokeWidth={2} />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Tersimpan',
          tabBarIcon: ({ focused }) => (
            <View style={getIconStyle(focused)}>
              <Bookmark size={24} color={focused ? '#FFF' : '#9CA3AF'} strokeWidth={2} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused }) => (
            <View style={getIconStyle(focused)}>
              <User size={24} color={focused ? '#FFF' : '#9CA3AF'} strokeWidth={2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}