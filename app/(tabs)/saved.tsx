import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ref, onValue } from 'firebase/database';
import { auth, db } from '@/services/firebaseConfig';
import { Colors } from '@/constants/Colors';
import { Plane, Clock } from 'lucide-react-native';
import CustomAlert from '@/components/ui/CustomAlert';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function SavedScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [navTarget, setNavTarget] = useState<any>(null);
  const [alertVisible, setAlertVisible] = useState(false);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const favRef = ref(db, `users/${userId}/favorites`);
    const unsubscribe = onValue(favRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map((key) => ({ dbKey: key, ...data[key] }));
        setFavorites(list.reverse());
      } else { setFavorites([]); }
    });
    return unsubscribe;
  }, []);

  const handleFlyRequest = (item: any) => {
    setNavTarget(item);
    setAlertVisible(true);
  };

  const executeFlyTo = () => {
    setAlertVisible(false);
    if (navTarget) {
      router.push({
        pathname: '/(tabs)',
        params: {
          startNav: 'true',
          lat: navTarget.origin.lat,
          lng: navTarget.origin.lng,
          name: navTarget.origin.name || navTarget.origin.city,
          id: navTarget.origin.code
        }
      });
    }
  };

  const handleEdit = (item: any) => {
    router.push({
      pathname: '/edit-saved',
      params: { 
        dbKey: item.dbKey, flightNumber: item.flightNumber, airline: item.airline,
        originCity: item.origin.city, originCode: item.origin.code,
        destCity: item.destination.city, destCode: item.destination.code, time: item.time
      }
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']} >
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <View><Text style={styles.title}>Rencana Penerbangan</Text><Text style={styles.subtitle}>Jadwal tersimpan</Text></View>
        <View style={styles.countBadge}><Text style={styles.countText}>{favorites.length}</Text></View>
      </View>
      <FlatList
        data={favorites} keyExtractor={(item) => item.dbKey} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 }} showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconBg}><Plane size={40} color={Colors.light.icon} /></View>
            <Text style={styles.emptyText}>Belum ada jadwal tersimpan.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => handleEdit(item)}>
            <View style={styles.cardContent}>
                <View style={{ flex: 1 }}>
                    <View style={styles.metaRow}>
                        <Text style={styles.airlineText}>{item.airline}</Text>
                        <View style={styles.dotSeparator} />
                        <Text style={styles.flightNum}>{item.flightNumber}</Text>
                    </View>
                    <View style={styles.routeRow}>
                        <Text style={styles.code}>{item.origin.code}</Text>
                        <View style={styles.pathContainer}><View style={styles.pathDot} /><View style={styles.dashedLine} /><View style={styles.pathDot} /></View>
                        <Text style={styles.code}>{item.destination.code}</Text>
                    </View>
                    <View style={styles.detailsRow}>
                        <Text style={styles.cityName} numberOfLines={1}>{item.origin.city.split(',')[0]}</Text>
                        <View style={styles.timeBadge}><Clock size={10} color={Colors.light.icon} /><Text style={styles.timeText}>{item.time}</Text></View>
                        <Text style={[styles.cityName, { textAlign: 'right' }]} numberOfLines={1}>{item.destination.city.split(',')[0]}</Text>
                    </View>
                </View>
                <View style={styles.actionColumn}>
                    <TouchableOpacity style={styles.navButton} onPress={(e) => { e.stopPropagation(); handleFlyRequest(item); }}>
                        <Plane size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
          </TouchableOpacity>
        )}
      />
      <CustomAlert visible={alertVisible} type="info" title="Mulai Perjalanan?" message={`Aplikasi akan mengarahkan rute menuju ${navTarget?.origin?.city}.`} confirmText="Berangkat" cancelText="Batal" onConfirm={executeFlyTo} onClose={() => setAlertVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' }, 
  header: { paddingHorizontal: 24, paddingVertical: 20, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', marginBottom: 0 },
  title: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: Colors.light.text },
  subtitle: { color: Colors.light.icon, fontSize: 13, fontFamily: 'Poppins_400Regular' },
  countBadge: { backgroundColor: Colors.light.primary, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 50 },
  countText: { color: 'white', fontFamily: 'Poppins_700Bold', fontSize: 20, width: 30, height: 30, textAlign: 'center', lineHeight: 30 },
  card: { backgroundColor: 'white', borderRadius: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3, borderWidth: 1, borderColor: '#F3F4F6', overflow: 'hidden' },
  cardContent: { flexDirection: 'row', padding: 18, alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  airlineText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: Colors.light.primary },
  dotSeparator: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', marginHorizontal: 8 },
  flightNum: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.light.icon },
  routeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  code: { fontSize: 26, fontFamily: 'Poppins_700Bold', color: Colors.light.text },
  pathContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', marginHorizontal: 12 },
  pathDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E5E7EB' },
  dashedLine: { flex: 1, height: 1, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed', borderRadius: 1 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cityName: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: Colors.light.icon, maxWidth: 80 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  timeText: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: Colors.light.text },
  actionColumn: { marginLeft: 16, paddingLeft: 16, borderLeftWidth: 1, borderLeftColor: '#F3F4F6', justifyContent: 'center' },
  navButton: { width: 44, height: 44, backgroundColor: Colors.light.primary, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.light.primary, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyText: { color: Colors.light.icon, fontFamily: 'Poppins_400Regular' },
});