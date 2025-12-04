import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, db } from '@/services/firebaseConfig';
import { useRouter, Link } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Mail, Lock, CheckCircle, MapPin } from 'lucide-react-native';
import CustomAlert from '@/components/ui/CustomAlert';
import { StatusBar } from 'expo-status-bar';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [alert, setAlert] = useState({ visible: false, message: '', type: 'info' as 'error' | 'success' | 'info' });
  const showAlert = (message: string, type: 'error' | 'success') => setAlert({ visible: true, message, type });

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      showAlert("Mohon lengkapi semua kolom.", "error");
      return;
    }
    if (password !== confirmPassword) {
      showAlert("Konfirmasi kata sandi tidak cocok.", "error");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await set(ref(db, 'users/' + user.uid + '/profile'), {
        username: username,
        email: user.email,
        createdAt: new Date().toISOString(),
        role: 'user'
      });
      showAlert("Akun Berhasil Dibuat!", "success");
      setTimeout(() => router.replace('/(tabs)'), 1500);
    } catch (error: any) {
        if(error.code === 'auth/email-already-in-use') showAlert("Email ini sudah terdaftar.", "error");
        else if(error.code === 'auth/weak-password') showAlert("Kata sandi terlalu lemah (min. 6 karakter).", "error");
        else showAlert("Terjadi kesalahan sistem.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <CustomAlert visible={alert.visible} message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, visible: false })} />

      <View style={styles.upperBg}>
        <MapPin size={280} color="rgba(255,255,255,0.06)" style={styles.bgIcon} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent, 
            { paddingBottom: insets.bottom + 20, paddingTop: insets.top }
          ]} 
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          
          <View style={styles.centerContentWrapper}>
            
            <View style={styles.headerSection}>
              <Text style={styles.headerTitle}>Buat Akun</Text>
              <Text style={styles.headerSub}>Bergabunglah dengan AIRA</Text>
            </View>

            <View style={styles.cardContainer}>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconBox}><User size={18} color={Colors.light.primary} /></View>
                  <TextInputShim placeholder="Nama Pengguna" value={username} onChangeText={setUsername} />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconBox}><Mail size={18} color={Colors.light.primary} /></View>
                  <TextInputShim placeholder="nama@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
                </View>
              </View>

              <View style={styles.rowInputs}>
                  <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.inputLabel}>Kata Sandi</Text>
                      <View style={styles.inputWrapper}>
                          <View style={[styles.iconBox, { width: 36 }]}><Lock size={18} color={Colors.light.primary} /></View>
                          <TextInputShim placeholder="••••••" value={password} onChangeText={setPassword} secureTextEntry />
                      </View>
                  </View>
                  <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.inputLabel}>Konfirmasi</Text>
                      <View style={styles.inputWrapper}>
                          <View style={[styles.iconBox, { width: 36 }]}><CheckCircle size={18} color={Colors.light.primary} /></View>
                          <TextInputShim placeholder="••••••" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
                      </View>
                  </View>
              </View>

              <View style={styles.termsContainer}>
                  <Text style={styles.termsText}>
                      Dengan mendaftar, Anda menyetujui <Text style={{ color: Colors.light.primary, fontWeight: '700' }}>Syarat & Ketentuan</Text> kami.
                  </Text>
              </View>

              <TouchableOpacity 
                style={[styles.mainButton, loading && { opacity: 0.7 }]} 
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.mainButtonText}>{loading ? "MEMPROSES..." : "DAFTAR"}</Text>
              </TouchableOpacity>

            </View>

            <View style={styles.footerSection}>
               <Text style={styles.footerText}>Sudah punya akun?</Text>
               <Link href="/(auth)/login" asChild>
                  <TouchableOpacity style={styles.loginLinkBtn}>
                     <Text style={styles.loginLinkText}>Masuk di sini</Text>
                  </TouchableOpacity>
               </Link>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const TextInputShim = ({ ...props }: any) => {
    const { TextInput } = require('react-native');
    return <TextInput style={styles.textInput} placeholderTextColor="#B0B5C1" autoCapitalize="none" {...props} />
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F5F8' },

  upperBg: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
    backgroundColor: Colors.light.primary,
    borderBottomLeftRadius: 100, 
    borderBottomRightRadius: 20, 
    overflow: 'hidden',
  },
  bgIcon: { position: 'absolute', bottom: -50, right: -40, opacity: 0.1 },

  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
  },
  centerContentWrapper: { width: '100%', paddingVertical: 20 },

  headerSection: { paddingHorizontal: 30, marginBottom: 25, alignItems: 'center' },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 36, color: 'white', marginBottom: 4 },
  headerSub: { fontFamily: 'Poppins_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },

  cardContainer: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 28,
    shadowColor: Colors.light.primary, shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },

  inputContainer: { marginBottom: 16 },
  rowInputs: { flexDirection: 'row' },
  inputLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: Colors.light.text, marginBottom: 6, marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', height: 52,
  },
  iconBox: { width: 44, justifyContent: 'center', alignItems: 'center' },
  textInput: { flex: 1, fontFamily: 'Poppins_500Medium', fontSize: 14, color: Colors.light.text, height: '100%' },

  termsContainer: { marginBottom: 20, paddingHorizontal: 4 },
  termsText: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#94A3B8', textAlign: 'center', lineHeight: 16 },

  mainButton: {
    backgroundColor: Colors.light.primary, height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.light.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6
  },
  mainButtonText: { fontFamily: 'Poppins_700Bold', color: 'white', fontSize: 15, letterSpacing: 0.5 },

  footerSection: { marginTop: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  footerText: { fontFamily: 'Poppins_400Regular', color: '#64748B' },
  loginLinkBtn: { paddingVertical: 4 },
  loginLinkText: { fontFamily: 'Poppins_700Bold', color: Colors.light.primary, fontSize: 15 },
});