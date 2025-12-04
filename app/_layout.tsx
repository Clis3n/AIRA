import { useEffect, useState, useCallback } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/services/firebaseConfig';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform, View } from 'react-native';
import { Colors } from '@/constants/Colors';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  
  const router = useRouter();
  const segments = useSegments();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync("#FFFFFF");
      NavigationBar.setButtonStyleAsync("dark");
    }
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      const inAuthGroup = segments[0] === '(auth)';
      
      if (currentUser && inAuthGroup) {
        router.replace('/(tabs)');
      } 
      else if (!currentUser && !inAuthGroup) {
        router.replace('/(auth)/login');
      }

      setIsAuthChecked(true);
    });

    return unsubscribe;
  }, [segments, fontsLoaded]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && isAuthChecked) {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn("SplashScreen hide error:", e);
      }
    }
  }, [fontsLoaded, isAuthChecked]);

  if (!fontsLoaded || !isAuthChecked) {
    return <View style={{ flex: 1, backgroundColor: Colors.light.background }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background }} onLayout={onLayoutRootView}>
      <StatusBar style="dark" translucent={false} backgroundColor="#FFFFFF" />
      
      <Stack 
        screenOptions={{ 
          headerShown: false, 
          animation: 'fade', 
          contentStyle: { backgroundColor: Colors.light.background } 
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </View>
  );
}