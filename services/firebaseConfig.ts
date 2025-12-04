import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAAq8VuzKIiE-h-tm3Is70qP2dQ25xiYQU",
  authDomain: "observa-ai.firebaseapp.com",
  databaseURL: "https://observa-ai-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "observa-ai",
  storageBucket: "observa-ai.firebasestorage.app",
  messagingSenderId: "245863694203",
  appId: "1:245863694203:web:2b35ae20fb20f90c7147de",
  measurementId: "G-C7JCL3ZXND"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getDatabase(app);

export { auth, db };