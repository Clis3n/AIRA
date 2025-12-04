import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { ArrowLeft, AlertTriangle, Trash2, CheckCircle2 } from 'lucide-react-native';
import { auth, db } from '@/services/firebaseConfig';
import { deleteUser } from 'firebase/auth';
import { ref, remove } from 'firebase/database';
import CustomAlert from '@/components/ui/CustomAlert';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [confirmAlert, setConfirmAlert] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info' as 'info' | 'success' | 'error' });

  const handleFinalDelete = async () => {
    setConfirmAlert(false);
    setLoading(true);
    const user = auth.currentUser;
    if (!user) return;

    try {
      await remove(ref(db, `users/${user.uid}`));
      await deleteUser(user);
      
      setAlert({ visible: true, title: 'Terhapus', message: 'Akun berhasil dihapus.', type: 'success' });
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        Alert.alert("Gagal", "Demi keamanan, silakan Logout lalu Login kembali sebelum menghapus akun.");
      } else {
        setAlert({ visible: true, title: 'Gagal', message: error.message, type: 'error' });
      }
    } finally {
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
          <ArrowLeft size={22} color={Colors.light.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hapus Akun</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 100 + insets.bottom }]}>
        
        <View style={styles.cardCenter}>
          <View style={styles.warningIconWrapper}>
            <AlertTriangle size={32} color="#DC2626" strokeWidth={2.5} />
          </View>
          <Text style={styles.warningTitle}>Tindakan Permanen</Text>
          <Text style={styles.warningDesc}>
            Akun yang dihapus tidak dapat dipulihkan kembali. Seluruh riwayat penerbangan akan hilang.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Konsekuensi Penghapusan</Text>
          
          <View style={styles.listItem}>
            <CheckCircle2 size={20} color="#DC2626" strokeWidth={2} />
            <Text style={styles.listText}>Profil dan Username akan dihapus permanen.</Text>
          </View>
          
          <View style={styles.listItem}>
            <CheckCircle2 size={20} color="#DC2626" strokeWidth={2} />
            <Text style={styles.listText}>Semua Flight Plan tersimpan akan hilang.</Text>
          </View>
          
          <View style={styles.listItem}>
            <CheckCircle2 size={20} color="#DC2626" strokeWidth={2} />
            <Text style={styles.listText}>Akses login akun ini akan ditutup selamanya.</Text>
          </View>
        </View>

      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={styles.deleteButton} onPress={() => setConfirmAlert(true)} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Trash2 size={20} color="white" strokeWidth={2} />
              <Text style={styles.deleteText}>Hapus Akun Permanen</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <CustomAlert 
        visible={confirmAlert}
        type="error"
        title="Konfirmasi Akhir"
        message="Apakah Anda yakin? Data tidak bisa dikembalikan!"
        confirmText="Ya, Hapus"
        onClose={() => setConfirmAlert(false)}
        onConfirm={handleFinalDelete}
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
  backBtn: { 
    padding: 10, borderRadius: 12, backgroundColor: '#ffffffff', 
  },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#DC2626' },
  
  content: { padding: 20 },

  cardCenter: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1, borderColor: '#FEE2E2'
  },
  warningIconWrapper: {
    width: 64, height: 64,
    backgroundColor: '#FEE2E2',
    borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16
  },
  warningTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#DC2626', marginBottom: 8 },
  warningDesc: { fontFamily: 'Poppins_400Regular', color: Colors.light.icon, textAlign: 'center', lineHeight: 22, fontSize: 13 },

  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1, borderColor: '#F9FAFB'
  },
  cardTitle: { fontFamily: 'Poppins_700Bold', fontSize: 16, marginBottom: 16, color: Colors.light.text },

  listItem: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  listText: { fontFamily: 'Poppins_400Regular', color: Colors.light.text, flex: 1, lineHeight: 20, fontSize: 13 },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'white', paddingTop: 20, paddingHorizontal: 20,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 15
  },
  deleteButton: {
    backgroundColor: '#DC2626', height: 56,
    borderRadius: 20,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
    shadowColor: '#DC2626', shadowOpacity: 0.3, shadowRadius: 8, elevation: 6
  },
  deleteText: { fontFamily: 'Poppins_600SemiBold', color: 'white', fontSize: 16 },
});