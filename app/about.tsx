import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { ArrowLeft, MapPin, Award, User, BookOpen, Plane } from 'lucide-react-native';

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const InfoRow = ({ icon, label, value }: any) => (
    <View style={styles.row}>
      <View style={styles.iconBox}>{icon}</View>
      <View style={styles.infoContent}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.light.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tentang Aplikasi</Text>
        <View style={{ width: 44 }} /> 
      </View>
      
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        
        <View style={styles.cardCenter}>
          <View style={styles.logoBadge}>
            <Plane size={42} color="white" strokeWidth={2} />
          </View>
          <Text style={styles.appName}>AIRA</Text>
          <Text style={styles.version}>Versi 1.0.0 (Beta)</Text>
          <Text style={styles.descText}>
            Sistem pelacakan penerbangan realtime dengan visualisasi peta interaktif.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informasi Pengembang</Text>
          
          <InfoRow 
            icon={<User size={20} color={Colors.light.primary} strokeWidth={2} />} 
            label="Nama Lengkap" 
            value="Clisen Ardy Laksono Wicaksono" 
          />
          <View style={styles.divider} />
          
          <InfoRow 
            icon={<Award size={20} color={Colors.light.primary} strokeWidth={2} />} 
            label="NIM" 
            value="23/517152/SV/22742" 
          />
          <View style={styles.divider} />
          
          <InfoRow 
            icon={<BookOpen size={20} color={Colors.light.primary} strokeWidth={2} />} 
            label="Mata Kuliah" 
            value="Praktikum Pemrograman Geospasial: Perangkat Bergerak Lanjut" 
          />
          <View style={styles.divider} />
          
          <InfoRow 
            icon={<MapPin size={20} color={Colors.light.primary} strokeWidth={2} />} 
            label="Wilayah Studi" 
            value="Global (Internasional)" 
          />
        </View>

        <Text style={styles.copyright}>© 2025 Clisen Ardy L.W. All rights reserved.</Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingBottom: 20, 
    backgroundColor: 'white',
    borderBottomWidth: 1, borderColor: '#F3F4F6'
  },
  backBtn: { 
    padding: 10, borderRadius: 12, backgroundColor: '#ffffffff', 
  },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: Colors.light.text },
  
  content: { padding: 20 },

  cardCenter: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 30,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1, borderColor: '#F9FAFB'
  },
  logoBadge: {
    width: 80, height: 80,
    backgroundColor: Colors.light.primary,
    borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.light.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5
  },
  appName: { fontFamily: 'Poppins_700Bold', fontSize: 22, color: Colors.light.text, textAlign: 'center' },
  version: { fontFamily: 'Poppins_500Medium', color: Colors.light.icon, fontSize: 13, marginBottom: 16 },
  descText: { textAlign: 'center', fontFamily: 'Poppins_400Regular', color: Colors.light.icon, lineHeight: 22, fontSize: 13 },

  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1, borderColor: '#F9FAFB'
  },
  cardTitle: { fontFamily: 'Poppins_700Bold', fontSize: 16, marginBottom: 20, color: Colors.light.text },

  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  iconBox: {
    width: 48, height: 48,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 16,
  },
  infoContent: { flex: 1 },
  label: { fontFamily: 'Poppins_600SemiBold', fontSize: 10, color: Colors.light.icon, textTransform: 'uppercase', marginBottom: 2 },
  value: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: Colors.light.text },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12, marginLeft: 64 },
  
  copyright: { textAlign: 'center', fontFamily: 'Poppins_400Regular', color: '#9CA3AF', fontSize: 11, marginTop: 10 },
});