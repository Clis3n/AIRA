import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/services/firebaseConfig';
import { useRouter, Link } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff, Globe } from 'lucide-react-native';
import CustomAlert from '@/components/ui/CustomAlert';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [alert, setAlert] = useState({ visible: false, message: '', type: 'info' as 'error' | 'success' | 'info' });
  const showAlert = (message: string, type: 'error' | 'success') => setAlert({ visible: true, message, type });

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert("Mohon isi email dan kata sandi.", "error");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showAlert("Login Berhasil! Mengalihkan...", "success");
      setTimeout(() => router.replace('/(tabs)'), 1000);
    } catch (error: any) {
      showAlert("Email atau kata sandi salah.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <CustomAlert visible={alert.visible} message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, visible: false })} />

      <View style={styles.upperBg}>
        <Globe size={300} color="rgba(255,255,255,0.06)" style={styles.bgGlobe} />
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
              <Text style={styles.welcomeTitle}>AIRA</Text>
              <Text style={styles.welcomeSub}>Aplikasi Pelacak Penerbangan</Text>
            </View>

            <View style={styles.cardContainer}>
              <Text style={styles.cardHeader}>Selamat Datang</Text>
              <Text style={styles.cardDesc}>Masuk untuk melanjutkan akses</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Alamat Email</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconBox}><Mail size={18} color={Colors.light.primary} /></View>
                  <TextInputShim 
                    placeholder="nama@email.com" 
                    value={email} onChangeText={setEmail} keyboardType="email-address" 
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Kata Sandi</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconBox}><Lock size={18} color={Colors.light.primary} /></View>
                  <TextInputShim 
                    placeholder="••••••••" 
                    value={password} onChangeText={setPassword} secureTextEntry={!showPassword} 
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    {showPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.forgotRow}>
                <Text style={styles.forgotText}>Lupa kata sandi?</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.mainButton, loading && { opacity: 0.7 }]} 
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.mainButtonText}>{loading ? "MEMPROSES..." : "MASUK"}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footerSection}>
               <Text style={styles.footerText}>Belum memiliki akun?</Text>
               <Link href="/(auth)/register" asChild>
                  <TouchableOpacity style={styles.registerLinkBtn}>
                     <Text style={styles.registerLinkText}>Daftar sekarang</Text>
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
    position: 'absolute', top: 0, left: 0, right: 0, height: '55%', 
    backgroundColor: Colors.light.primary,
    borderBottomRightRadius: 100, 
    borderBottomLeftRadius: 20, 
    overflow: 'hidden',
  },
  bgGlobe: { position: 'absolute', top: '10%', right: -80, opacity: 0.1 },

  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
  },
  centerContentWrapper: {
    width: '100%',
    paddingVertical: 20, 
  },

  headerSection: { 
    paddingHorizontal: 30, 
    marginBottom: 30, 
    alignItems: 'center', 
  },
  welcomeTitle: { 
    fontFamily: 'Poppins_700Bold', 
    fontSize: 42, 
    color: 'white', 
    letterSpacing: 1,
    marginBottom: 4
  },
  welcomeSub: { 
    fontFamily: 'Poppins_400Regular', 
    fontSize: 15, 
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center'
  },

  cardContainer: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 28, 
    shadowColor: Colors.light.primary, shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  cardHeader: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: Colors.light.text, marginBottom: 6, textAlign: 'center' },
  cardDesc: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: Colors.light.icon, marginBottom: 28, textAlign: 'center' },

  inputContainer: { marginBottom: 18 },
  inputLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: Colors.light.text, marginBottom: 8, marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', height: 54,
  },
  iconBox: { width: 46, justifyContent: 'center', alignItems: 'center' },
  textInput: { flex: 1, fontFamily: 'Poppins_500Medium', fontSize: 14, color: Colors.light.text, height: '100%' },
  eyeBtn: { padding: 12 },

  forgotRow: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { fontFamily: 'Poppins_500Medium', color: Colors.light.primary, fontSize: 12 },

  mainButton: {
    backgroundColor: Colors.light.primary, height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.light.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6
  },
  mainButtonText: { fontFamily: 'Poppins_700Bold', color: 'white', fontSize: 15, letterSpacing: 0.5 },

  footerSection: { marginTop: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  footerText: { fontFamily: 'Poppins_400Regular', color: '#64748B' },
  registerLinkBtn: { paddingVertical: 4 },
  registerLinkText: { fontFamily: 'Poppins_700Bold', color: Colors.light.primary, fontSize: 15 },
});