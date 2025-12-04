import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Keyboard, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Search, MapPin, Plane, Clock, ArrowUpRight, History, XCircle, TrendingUp, Calendar, Filter, Bookmark, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { push, ref, set } from "firebase/database";
import { auth, db } from '@/services/firebaseConfig';
import CustomAlert from '@/components/ui/CustomAlert';

const GOOGLE_API_KEY = "AIzaSyByJbhP7GXwvGkQDH7S-MMpZcbYSY8sReA";
const AVIATION_API_KEY = "7a1ec2f2f516bdaecf07d567d35de0b7";

type SearchType = 'airport' | 'flight';

export default function SearchScreen() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<SearchType>('airport');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  
  const [selectedFilter, setSelectedFilter] = useState<string>('Semua');
  
  const [recentSearches, setRecentSearches] = useState<string[]>(['Changi Airport', 'Soekarno Hatta', 'GA-404']);
  
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean; 
    type: 'success' | 'error' | 'warning' | 'info'; 
    title: string; 
    message: string; 
    onConfirm?: () => void;
    confirmText?: string; 
    cancelText?: string; 
  }>({ visible: false, type: 'info', title: '', message: '' });

  const searchAirports = async (text: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=airport+${text}&key=${GOOGLE_API_KEY}`
      );
      const json = await response.json();
      if (json.results) {
        return json.results.map((item: any) => ({
          type: 'airport',
          id: item.place_id,
          title: item.name,
          subtitle: item.formatted_address,
          lat: item.geometry.location.lat,
          lng: item.geometry.location.lng,
          code: 'APT'
        }));
      }
      return [];
    } catch (error) {
      return [];
    }
  };

  const searchFlights = async (text: string) => {
    try {
        const url = `http://api.aviationstack.com/v1/flights?access_key=${AVIATION_API_KEY}&flight_iata=${text}&limit=10`;
        const response = await fetch(url);
        const json = await response.json();

        if (json.data) {
            return json.data.map((item: any, index: number) => ({
                type: 'flight',
                id: `${item.flight?.iata}-${index}-${Math.random().toString(36).substr(2, 9)}`,
                title: `${item.airline?.name} (${item.flight?.iata})`,
                subtitle: `Ke: ${item.arrival?.airport || item.arrival?.iata || 'Unknown'}`,
                time: item.departure?.scheduled ? new Date(item.departure.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
                status: item.flight_status ? (item.flight_status.charAt(0).toUpperCase() + item.flight_status.slice(1)) : 'Scheduled',
                flightNumber: item.flight?.iata,
                airline: item.airline?.name,
                origin: { code: item.departure?.iata, city: item.departure?.airport },
                destination: { code: item.arrival?.iata, city: item.arrival?.airport }
            }));
        }
        return [];
    } catch (error) {
        console.log("Flight API Error:", error);
        return [];
    }
  };

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 3) { 
      setResults([]);
      return;
    }

    setLoading(true);
    let data = [];
    
    if (activeTab === 'airport') {
      data = await searchAirports(text);
    } else {
      data = await searchFlights(text);
    }
    
    setResults(data);
    setLoading(false);
  };

  const handleSaveFlight = (item: any) => {
      const userId = auth.currentUser?.uid;
      if (!userId) {
          setAlertConfig({ visible: true, type: 'warning', title: 'Login Diperlukan', message: 'Silakan login untuk menyimpan jadwal.' });
          return;
      }

      setAlertConfig({
          visible: true,
          type: 'info',
          title: 'Simpan Jadwal?',
          message: `Tambahkan ${item.title} ke Rencana Penerbangan?`,
          onConfirm: async () => {
              setAlertConfig(prev => ({...prev, visible: false}));
              try {
                  const newRef = push(ref(db, `users/${userId}/favorites`));
                  await set(newRef, {
                      flightNumber: item.flightNumber,
                      airline: item.airline,
                      time: item.time,
                      origin: item.origin,
                      destination: item.destination,
                      savedAt: new Date().toISOString()
                  });
                  setTimeout(() => {
                    setAlertConfig({ visible: true, type: 'success', title: 'Berhasil', message: 'Jadwal tersimpan.' });
                  }, 500);
              } catch (e) {
                  setAlertConfig({ visible: true, type: 'error', title: 'Gagal', message: 'Terjadi kesalahan.' });
              }
          }
      });
  };

  const handleSelectItem = (item: any) => {
    if (!recentSearches.includes(item.title)) {
        setRecentSearches(prev => [item.title, ...prev].slice(0, 5));
    }

    if (item.type === 'airport') {
      setAlertConfig({
        visible: true,
        type: 'info',
        title: 'Lihat di Peta?',
        message: `Lihat lokasi ${item.title} di peta?`,
        confirmText: 'Lihat',
        onConfirm: () => {
            setAlertConfig(prev => ({...prev, visible: false}));
            
            router.push({
                pathname: '/(tabs)', 
                params: {
                  focusMap: 'true', 
                  lat: item.lat,
                  lng: item.lng,
                  name: item.title,
                  city: item.subtitle,
                  id: item.id
                }
            });
        }
      });
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <View>
            <Text style={styles.title}>Pencarian</Text>
            <Text style={styles.subtitle}>Temukan bandara & jadwal live</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.inputWrapper}>
          <Search size={20} color={Colors.light.icon} />
          <TextInput 
            style={styles.input}
            placeholder={activeTab === 'airport' ? "Cari kota atau bandara..." : "Masukkan No. Penerbangan..."}
            placeholderTextColor="#A1A1AA"
            value={query}
            onChangeText={handleSearch}
            autoFocus={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <XCircle size={20} color={Colors.light.icon} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'airport' && styles.activeTab]} 
          onPress={() => { setActiveTab('airport'); setQuery(''); setResults([]); }}
        >
          <MapPin size={16} color={activeTab === 'airport' ? 'white' : Colors.light.primary} />
          <Text style={[styles.tabText, activeTab === 'airport' && styles.activeTabText]}>Bandara</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'flight' && styles.activeTab]} 
          onPress={() => { setActiveTab('flight'); setQuery(''); setResults([]); setSelectedFilter('Semua'); }}
        >
          <Plane size={16} color={activeTab === 'flight' ? 'white' : Colors.light.primary} />
          <Text style={[styles.tabText, activeTab === 'flight' && styles.activeTabText]}>Penerbangan</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Memindai Lokasi...</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 10, paddingTop: 10 }}
            
            ListEmptyComponent={
              query.length > 0 && results.length === 0 ? (
                  <View style={styles.noDataBox}>
                      <View style={styles.noDataIcon}>
                          <Search size={32} color={Colors.light.icon} />
                      </View>
                      <Text style={styles.noDataTitle}>Tidak Ditemukan</Text>
                      <Text style={styles.noDataDesc}>
                          {activeTab === 'flight' ? 'Pastikan nomor penerbangan benar (Contoh: GA821)' : 'Coba kata kunci lain.'}
                      </Text>
                  </View>
              ) : (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {recentSearches.length > 0 && (
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <History size={16} color={Colors.light.icon} />
                            <Text style={styles.sectionTitle}>Pencarian Terakhir</Text>
                        </View>
                        <View style={styles.chipsWrap}>
                          {recentSearches.map((text, index) => (
                            <TouchableOpacity key={index} style={styles.historyChip} onPress={() => handleSearch(text)}>
                              <Text style={styles.historyText}>{text}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <TrendingUp size={16} color={Colors.light.primary} />
                            <Text style={styles.sectionTitle}>Bandara Populer</Text>
                        </View>
                        
                        {['Soekarno Hatta', 'Ngurah Rai Bali', 'Changi Singapore', 'Haneda Tokyo'].map((apt, idx) => (
                            <TouchableOpacity key={idx} style={styles.popularItem} onPress={() => {
                                setActiveTab('airport');
                                handleSearch(apt);
                            }}>
                                <Text style={styles.popularText}>{apt}</Text>
                                <ArrowUpRight size={16} color={Colors.light.icon} />
                            </TouchableOpacity>
                        ))}
                    </View>
                  </ScrollView>
              )
            }

            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultCard} onPress={() => handleSelectItem(item)}>
                <View style={styles.iconCircle}>
                  {activeTab === 'airport' ? (
                    <MapPin size={20} color={Colors.light.primary} />
                  ) : (
                    <Plane size={20} color={Colors.light.primary} />
                  )}
                </View>
                
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.time && (
                        <View style={styles.timeBadge}>
                            <Clock size={10} color={Colors.light.icon} />
                            <Text style={styles.timeText}>{item.time}</Text>
                        </View>
                    )}
                  </View>
                  <Text style={styles.itemSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                  
                  {item.status && (
                      <Text style={[
                          styles.statusText, 
                          (item.status === 'Cancelled' || item.status === 'Delayed') ? { color: '#DC2626' } : { color: '#16A34A' }
                      ]}>
                          Status: {item.status}
                      </Text>
                  )}
                </View>
                
                {activeTab === 'flight' ? (
                    <TouchableOpacity style={styles.saveBtn} onPress={() => handleSaveFlight(item)}>
                        <Bookmark size={20} color={Colors.light.primary} strokeWidth={2} />
                    </TouchableOpacity>
                ) : (
                    <ArrowUpRight size={20} color="#D1D5DB" />
                )}
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <CustomAlert 
        visible={alertConfig.visible} 
        type={alertConfig.type} 
        title={alertConfig.title} 
        message={alertConfig.message} 
        confirmText={alertConfig.confirmText || 'Ya'}
        cancelText={alertConfig.cancelText || 'Batal'}
        onConfirm={alertConfig.onConfirm} 
        onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  
  header: { 
      paddingHorizontal: 24, 
      paddingVertical: 20, 
      backgroundColor: 'white',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6'
  },
  title: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: Colors.light.text },
  subtitle: { color: Colors.light.icon, fontSize: 13, fontFamily: 'Poppins_400Regular' },

  searchContainer: { paddingHorizontal: 24, marginVertical: 16 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F3F4F6', borderRadius: 16,
    paddingHorizontal: 16, height: 56,
    borderWidth: 1, borderColor: '#E5E7EB'
  },
  input: { flex: 1, marginLeft: 12, fontFamily: 'Poppins_500Medium', fontSize: 15, color: Colors.light.text, height: '100%' },

  tabContainer: { 
      flexDirection: 'row', paddingHorizontal: 24, marginBottom: 16, gap: 12 
  },
  tabButton: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      paddingVertical: 12, borderRadius: 14,
      backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB'
  },
  activeTab: {
      backgroundColor: Colors.light.primary, 
      borderColor: Colors.light.primary
  },
  tabText: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: Colors.light.primary },
  activeTabText: { color: 'white' },

  filterContainer: { marginBottom: 16 },
  chip: {
      paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
      backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB', marginRight: 0
  },
  activeChip: {
      backgroundColor: '#18181B', borderColor: '#18181B'
  },
  chipText: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: Colors.light.text },
  activeChipText: { color: 'white' },

  content: { flex: 1, paddingHorizontal: 24 },
  
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontFamily: 'Poppins_500Medium', color: Colors.light.icon },

  noDataBox: { alignItems: 'center', marginTop: 40 },
  noDataIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  noDataTitle: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: Colors.light.text, marginBottom: 4 },
  noDataDesc: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: Colors.light.icon, textAlign: 'center', maxWidth: 250 },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: Colors.light.text },
  
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  historyChip: {
      backgroundColor: '#F9FAFB', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
      borderWidth: 1, borderColor: '#F3F4F6'
  },
  historyText: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: Colors.light.text },

  popularItem: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6'
  },
  popularText: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: Colors.light.text },

  resultCard: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: 'white', padding: 16, borderRadius: 18, marginBottom: 12,
      shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
      elevation: 2, borderWidth: 1, borderColor: '#F9FAFB'
  },
  iconCircle: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
      marginRight: 14
  },
  itemTitle: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: Colors.light.text },
  itemSubtitle: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: Colors.light.icon, marginTop: 2, maxWidth: 200 },
  
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  timeText: { fontSize: 10, fontFamily: 'Poppins_600SemiBold', color: Colors.light.text },
  
  statusText: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', marginTop: 4 },

  saveBtn: { padding: 8 }
});
