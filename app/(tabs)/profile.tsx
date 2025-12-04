import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '@/services/firebaseConfig';
import { signOut } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { Colors } from '@/constants/Colors';
import { Power, Settings, ChevronRight, ShieldCheck, FileText, Trash, User, Mail } from 'lucide-react-native';
import CustomAlert from '@/components/ui/CustomAlert';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [logoutAlert, setLogoutAlert] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(db, `users/${user.uid}/profile`);
      const unsub = onValue(userRef, (snapshot) => {
        setProfile(snapshot.val());
      });
      return unsub;
    }
  }, []);

  const MenuItem = ({ icon, label, desc, onPress, isDestructive = false }: any) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconBox, isDestructive && styles.iconBoxDestructive]}>
          {icon}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.menuTitle, isDestructive && { color: '#DC2626' }]}>{label}</Text>
          {desc && <Text style={styles.menuDesc} numberOfLines={1}>{desc}</Text>}
        </View>

        <ChevronRight size={20} color="#D1D5DB" strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );

  const getInitial = () => {
    if (profile?.username) return profile.username.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        
        <View style={styles.card}>
          <View style={styles.cardContent}>
             
             <View style={styles.avatarPlaceholder}>
                {profile?.username ? (
                   <Text style={styles.avatarText}>{getInitial()}</Text>
                ) : (
                   <User size={32} color="white" strokeWidth={2} />
                )}
             </View>

             <View style={{ flex: 1, marginLeft: 16, justifyContent: 'center' }}>
                
                <Text style={styles.nameText} numberOfLines={1}>{profile?.username || 'Pengguna'}</Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                   <Mail size={14} color={Colors.light.icon} />
                   <Text style={styles.emailText} numberOfLines={1}>{auth.currentUser?.email}</Text>
                </View>

                <View style={styles.statusBadge}>
                   <ShieldCheck size={12} color={Colors.light.primary} />
                   <Text style={styles.statusText}>Akun Aktif</Text>
                </View>

             </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Pengaturan</Text>
          
          <MenuItem 
            icon={<Settings size={22} color={Colors.light.primary} strokeWidth={2} />}
            label="Sunting Profil"
            desc="Ubah nama & preferensi"
            onPress={() => router.push('/edit-profile')}
          />
          
          <MenuItem 
            icon={<FileText size={22} color={Colors.light.primary} strokeWidth={2} />}
            label="Tentang Aplikasi"
            desc="Versi 1.0.0 • Info"
            onPress={() => router.push('/about')}
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Lainnya</Text>
          
          <MenuItem 
            icon={<Power size={22} color="#DC2626" strokeWidth={2} />}
            label="Keluar"
            desc="Akhiri sesi saat ini"
            onPress={() => setLogoutAlert(true)}
            isDestructive
          />
          
          <MenuItem 
            icon={<Trash size={22} color="#DC2626" strokeWidth={2} />}
            label="Hapus Akun"
            desc="Menghapus data permanen"
            onPress={() => router.push('/delete-account')}
            isDestructive
          />
        </View>

      </ScrollView>

      <CustomAlert 
        visible={logoutAlert}
        type="warning"
        title="Logout?"
        message="Anda harus login kembali untuk masuk."
        confirmText="Keluar"
        onClose={() => setLogoutAlert(false)}
        onConfirm={() => {
          setLogoutAlert(false);
          signOut(auth);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  scrollContent: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 40 },

  card: {
    backgroundColor: 'white', 
    borderRadius: 20, 
    marginBottom: 12, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden'
  },
  cardContent: {
      flexDirection: 'row',
      padding: 20, 
      alignItems: 'center'
  },

  avatarPlaceholder: {
    width: 72, 
    height: 72, 
    borderRadius: 36, 
    backgroundColor: Colors.light.primary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2
  },
  avatarText: { fontFamily: 'Poppins_700Bold', fontSize: 28, color: 'white' },
  
  nameText: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: Colors.light.text, marginBottom: 2 },
  emailText: { fontFamily: 'Poppins_500Medium', color: Colors.light.icon, fontSize: 13 },
  
  statusBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start', 
    gap: 6,
    backgroundColor: '#F3F4F6', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 8,
    marginTop: 10, 
  },
  statusText: { color: Colors.light.primary, fontFamily: 'Poppins_600SemiBold', fontSize: 11 },

  sectionContainer: { marginTop: 16, marginBottom: 8 },
  sectionHeader: { 
    fontFamily: 'Poppins_600SemiBold', 
    fontSize: 12, 
    color: Colors.light.icon, 
    marginBottom: 12, 
    marginLeft: 8, 
    textTransform: 'uppercase', 
    letterSpacing: 1 
  },

  iconBox: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    backgroundColor: '#F3F4F6', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  iconBoxDestructive: {
    backgroundColor: '#FEE2E2',
  },
  menuTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: Colors.light.text, marginBottom: 2 },
  menuDesc: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: Colors.light.icon },
});