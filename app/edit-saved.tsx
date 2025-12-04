import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { auth, db } from '@/services/firebaseConfig';
import { ref, update, remove } from 'firebase/database';
import { Colors } from '@/constants/Colors';
import { ArrowLeft, Save, Plane, Clock, MapPin, Trash2 } from 'lucide-react-native';
import CustomAlert from '@/components/ui/CustomAlert';

export default function EditSavedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info' as any });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [airline, setAirline] = useState(params.airline as string);
  const [flightNumber, setFlightNumber] = useState(params.flightNumber as string);
  const [time, setTime] = useState(params.time as string);

  const handleUpdate = async () => {
    setLoading(true);
    const userId = auth.currentUser?.uid;
    if (!userId || !params.dbKey) return;

    try {
      const itemRef = ref(db, `users/${userId}/favorites/${params.dbKey}`);
      await update(itemRef, {
        airline,
        flightNumber,
        time,
        updatedAt: new Date().toISOString()
      });
      
      setAlert({ visible: true, title: 'Berhasil', message: 'Data jadwal berhasil diperbarui.', type: 'success' });
      setTimeout(() => router.back(), 1000);
    } catch (error) {
      setAlert({ visible: true, title: 'Gagal', message: 'Terjadi kesalahan saat menyimpan.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    setLoading(true);
    const userId = auth.currentUser?.uid;
    if (!userId || !params.dbKey) return;

    try {
        const itemRef = ref(db, `users/${userId}/favorites/${params.dbKey}`);
        await remove(itemRef);
        router.back();
    } catch (error) {
        setAlert({ visible: true, title: 'Gagal', message: 'Gagal menghapus data.', type: 'error' });
        setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomAlert 
        visible={alert.visible} 
        title={alert.title} 
        message={alert.message} 
        type={alert.type} 
        onClose={() => setAlert(prev => ({ ...prev, visible: false }))} 
      />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.light.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Data</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 100 + insets.bottom }]}>
        
        <View style={styles.routeCard}>
            <View style={styles.cityRow}>
                <Text style={styles.cityCode}>{params.originCode}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                </View>
                <Text style={styles.cityCode}>{params.destCode}</Text>
            </View>
            
            <View style={styles.cityNameRow}>
                <Text style={[styles.cityName, { textAlign: 'left', marginRight: 10 }]}>
                    {params.originCity}
                </Text>
                <Text style={[styles.cityName, { textAlign: 'right', marginLeft: 10 }]}>
                    {params.destCity}
                </Text>
            </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informasi Penerbangan</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Maskapai</Text>
            <View style={styles.inputWrapper}>
              <Plane size={20} color={Colors.light.primary} />
              <TextInput 
                style={styles.input} 
                value={airline} 
                onChangeText={setAirline} 
                placeholder="Nama Maskapai"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nomor Penerbangan</Text>
            <View style={styles.inputWrapper}>
              <MapPin size={20} color={Colors.light.primary} />
              <TextInput 
                style={styles.input} 
                value={flightNumber} 
                onChangeText={setFlightNumber} 
                placeholder="Contoh: GA-404"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Waktu Keberangkatan</Text>
            <View style={styles.inputWrapper}>
              <Clock size={20} color={Colors.light.primary} />
              <TextInput 
                style={styles.input} 
                value={time} 
                onChangeText={setTime} 
                placeholder="HH:MM"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity 
            style={styles.deleteButtonOutline} 
            onPress={() => setConfirmDelete(true)}
        >
            <Trash2 size={20} color="#DC2626" />
            <Text style={styles.deleteText}>Hapus Jadwal Ini</Text>
        </TouchableOpacity>

      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={styles.saveButton} onPress={handleUpdate} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Save size={20} color="white" strokeWidth={2.5} />
              <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <CustomAlert 
        visible={confirmDelete}
        type="error"
        title="Hapus Jadwal?"
        message="Data yang dihapus tidak dapat dikembalikan."
        confirmText="Ya, Hapus"
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
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
  backBtn: { padding: 10, borderRadius: 12, backgroundColor: '#ffffffff' },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: Colors.light.text },
  
  content: { padding: 20 },

  routeCard: {
      backgroundColor: '#18181B', 
      borderRadius: 24,
      padding: 24,
      marginBottom: 20,
      alignItems: 'center',
      shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 12 },
  cityCode: { fontSize: 32, fontFamily: 'Poppins_700Bold', color: 'white' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#52525B' },
  
  cityNameRow: { 
      flexDirection: 'row', 
      width: '100%', 
      justifyContent: 'space-between',
      alignItems: 'flex-start' 
  },
  cityName: { 
      color: '#A1A1AA', 
      fontSize: 12, 
      fontFamily: 'Poppins_500Medium',
      flex: 1, 
  },

  card: {
    backgroundColor: 'white', borderRadius: 24, padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 3,
    borderWidth: 1, borderColor: '#F3F4F6'
  },
  cardTitle: { fontFamily: 'Poppins_700Bold', fontSize: 16, marginBottom: 16, color: Colors.light.text },

  inputGroup: { marginBottom: 16 },
  label: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: Colors.light.text, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB',
    borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: '#E5E7EB'
  },
  input: { flex: 1, marginLeft: 12, fontFamily: 'Poppins_500Medium', color: Colors.light.text, fontSize: 14, height: '100%' },

  deleteButtonOutline: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
      padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#FEE2E2', backgroundColor: '#FEF2F2',
      marginBottom: 20
  },
  deleteText: { color: '#DC2626', fontFamily: 'Poppins_600SemiBold', fontSize: 14 },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'white', paddingTop: 20, paddingHorizontal: 20,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 20, elevation: 20
  },
  saveButton: {
    backgroundColor: Colors.light.primary, height: 58, borderRadius: 20,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
    shadowColor: Colors.light.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6
  },
  saveButtonText: { fontFamily: 'Poppins_600SemiBold', color: 'white', fontSize: 16 },
});