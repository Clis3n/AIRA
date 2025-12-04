import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { auth, db } from '@/services/firebaseConfig';
import { ref, update, onValue } from 'firebase/database';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Colors } from '@/constants/Colors';
import { ArrowLeft, Save, User, Lock, Mail, CheckCircle2 } from 'lucide-react-native';
import CustomAlert from '@/components/ui/CustomAlert';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info' as 'info' | 'success' | 'error' });

  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(db, `users/${user.uid}/profile`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) setUsername(data.username || '');
      }, { onlyOnce: true });
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      await update(ref(db, `users/${user.uid}/profile`), { username: username });

      if (newPassword) {
        if (!currentPassword) {
          setAlert({ visible: true, title: 'Gagal', message: 'Masukkan password lama untuk konfirmasi.', type: 'error' });
          setLoading(false); return;
        }
        
        const credential = EmailAuthProvider.credential(user.email!, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
      }

      setAlert({ visible: true, title: 'Sukses', message: 'Profil berhasil diperbarui.', type: 'success' });
      setTimeout(() => router.back(), 1500);

    } catch (error: any) {
      setAlert({ visible: true, title: 'Gagal', message: 'Password lama salah atau terjadi kesalahan.', type: 'error' });
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
        <Text style={styles.headerTitle}>Edit Profil</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 100 + insets.bottom }]}>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informasi Pribadi</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Terdaftar</Text>
            <View style={[styles.inputWrapper, { backgroundColor: '#F3F4F6', borderColor: 'transparent' }]}>
              <Mail size={20} color={Colors.light.icon} />
              <TextInput 
                style={[styles.input, { color: Colors.light.icon }]} 
                value={auth.currentUser?.email || ''} 
                editable={false} 
              />
              <CheckCircle2 size={18} color="#9CA3AF" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Pengguna</Text>
            <View style={styles.inputWrapper}>
              <User size={20} color={Colors.light.primary} />
              <TextInput 
                style={styles.input} 
                value={username} 
                onChangeText={setUsername} 
                placeholder="Callsign Anda" 
                placeholderTextColor="#D1D5DB"
              />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Keamanan Akun</Text>
          <View style={styles.infoBox}>
             <Text style={styles.infoText}>Isi kolom di bawah HANYA jika ingin mengubah kata sandi.</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kata Sandi Lama</Text>
            <View style={styles.inputWrapper}>
              <Lock size={20} color={Colors.light.icon} />
              <TextInput 
                style={styles.input} 
                value={currentPassword} 
                onChangeText={setCurrentPassword} 
                placeholder="••••••••" 
                placeholderTextColor="#D1D5DB"
                secureTextEntry 
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kata Sandi Baru</Text>
            <View style={styles.inputWrapper}>
              <Lock size={20} color={Colors.light.primary} />
              <TextInput 
                style={styles.input} 
                value={newPassword} 
                onChangeText={setNewPassword} 
                placeholder="Minimal 6 karakter" 
                placeholderTextColor="#D1D5DB"
                secureTextEntry 
              />
            </View>
          </View>
        </View>

      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Save size={20} color="white" strokeWidth={2} />
              <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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

  infoBox: {
    backgroundColor: '#EFF6FF', padding: 12, borderRadius: 12, marginBottom: 16,
    borderWidth: 1, borderColor: '#DBEAFE'
  },
  infoText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#2563EB', lineHeight: 18 },

  inputGroup: { marginBottom: 16 },
  label: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: Colors.light.text, marginBottom: 8 },
  
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16, height: 54,
    borderWidth: 1, borderColor: '#E5E7EB'
  },
  input: {
    flex: 1, marginLeft: 12, 
    fontFamily: 'Poppins_500Medium', color: Colors.light.text, fontSize: 14, height: '100%'
  },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'white', paddingTop: 20, paddingHorizontal: 20,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 15
  },
  saveButton: {
    backgroundColor: Colors.light.primary, height: 56,
    borderRadius: 20,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
    shadowColor: Colors.light.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6
  },
  saveButtonText: { fontFamily: 'Poppins_600SemiBold', color: 'white', fontSize: 16 },
});