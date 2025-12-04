# ✈️ AIRA - Flight Tracker & Navigation App

![Status](https://img.shields.io/badge/Status-Active_Development-blue?style=for-the-badge)
![Expo](https://img.shields.io/badge/Expo-52.0-000020?style=for-the-badge&logo=expo)
![React Native](https://img.shields.io/badge/React_Native-0.76-61DAFB?style=for-the-badge&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20DB-FFCA28?style=for-the-badge&logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)

**AIRA** adalah aplikasi *mobile* berbasis React Native (Expo) yang dirancang untuk memberikan pengalaman eksplorasi penerbangan dan navigasi geospasial yang intuitif. Aplikasi ini mengintegrasikan pemetaan *real-time*, pelacakan penerbangan, informasi bandara global, serta fitur navigasi berkendara (*turn-by-turn navigation*) menggunakan layanan Google Maps dan AviationStack.

---

## 📱 Tampilan Aplikasi (Screenshots)

<!-- Pastikan Anda menyimpan screenshot aplikasi di folder assets/images dengan nama file yang sesuai -->

| Login & Register | Peta & Navigasi | Pencarian |
|:---:|:---:|:---:|
| <img src="./assets/images/login-preview.png" width="200" alt="Login Screen" /> | <img src="./assets/images/map-preview.png" width="200" alt="Map Navigation" /> | <img src="./assets/images/search-preview.png" width="200" alt="Search Flight" /> |

| Jadwal Tersimpan | Profil Pengguna | Mode Gelap |
|:---:|:---:|:---:|
| <img src="./assets/images/saved-preview.png" width="200" alt="Saved Flights" /> | <img src="./assets/images/profile-preview.png" width="200" alt="User Profile" /> | <img src="./assets/images/darkmode-preview.png" width="200" alt="Dark Mode" /> |

---

## ✨ Fitur Utama

### 🗺️ Peta & Navigasi Cerdas
*   **Pemetaan Real-time:** Menampilkan lokasi pengguna, bandara sekitar, dan pergerakan arah hadap (*heading*) menggunakan `react-native-maps`.
*   **Navigasi Turn-by-Turn:** Simulasi rute berkendara dari lokasi pengguna ke bandara tujuan lengkap dengan instruksi jalan, estimasi waktu, dan jarak (Google Directions API).
*   **Visualisasi Rute:** Menampilkan garis rute (*Polyline*) antara bandara asal dan tujuan penerbangan.
*   **Tema Peta:** Mendukung tampilan Peta Standar dan Peta Mode Gelap (*Dark Mode*).

### 🔎 Pencarian & Data Penerbangan
*   **Pencarian Bandara:** Integrasi Google Places API untuk menemukan lokasi bandara secara global.
*   **Pelacakan Penerbangan:** Mencari status penerbangan berdasarkan kode IATA (contoh: GA404) menggunakan AviationStack API.
*   **Detail Penerbangan:** Informasi maskapai, nomor penerbangan, waktu keberangkatan, dan status (*Scheduled/Active/Landed*).

### 💾 Manajemen Data (Personalized)
*   **Simpan Jadwal:** Menyimpan rencana penerbangan ke daftar Favorit yang terhubung dengan **Firebase Realtime Database**.
*   **CRUD Jadwal:** Pengguna dapat melihat, mengedit, dan menghapus jadwal penerbangan yang telah disimpan.
*   **Akses Cepat:** Langsung memulai navigasi ke bandara dari daftar tersimpan.

### 👤 Autentikasi & Profil
*   **Keamanan Akun:** Login dan Register aman menggunakan **Firebase Authentication**.
*   **Manajemen Profil:** Mengubah username, update password dengan autentikasi ulang.
*   **Hapus Akun Permanen:** Fitur keamanan untuk menghapus seluruh data pengguna dari sistem.

---

## 🛠️ Teknologi yang Digunakan

*   **Framework:** [React Native](https://reactnative.dev/) dengan [Expo SDK 52](https://expo.dev/)
*   **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
*   **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
*   **Backend & Database:**
    *   Firebase Authentication (Email/Password)
    *   Firebase Realtime Database (JSON Tree)
*   **Maps & Location:**
    *   `react-native-maps` (Google Maps Provider)
    *   `expo-location` (GPS & Compass)
*   **API Eksternal:**
    *   Google Maps Platform (Maps SDK, Places API, Directions API)
    *   AviationStack API (Real-time Flight Data)
*   **UI/UX:**
    *   `lucide-react-native` (Ikon)
    *   `@expo-google-fonts/poppins` (Tipografi)
    *   Custom Components (Alerts, Cards)

---

## 📂 Struktur Proyek

```text
AIRA/
├── app/                    # Halaman & Routing (Expo Router)
│   ├── (auth)/             # Autentikasi (Login, Register, Layout)
│   ├── (tabs)/             # Tab Bar Utama (Map, Search, Saved, Profile)
│   ├── +html.tsx           # Entry point Web
│   ├── +not-found.tsx      # 404 Page
│   ├── _layout.tsx         # Root Layout & Auth Logic
│   ├── about.tsx           # Halaman Tentang Aplikasi
│   ├── delete-account.tsx  # Halaman Hapus Akun
│   ├── edit-profile.tsx    # Halaman Edit Profil
│   ├── edit-saved.tsx      # Halaman Edit Jadwal
│   └── modal.tsx           # Modal Screen
├── assets/                 # Gambar, Ikon, Fonts
├── components/             # Komponen UI Reusable
│   └── ui/
│       └── CustomAlert.tsx # Komponen Alert Kustom
├── constants/              # Warna & Konfigurasi Global
├── services/               # Konfigurasi Backend
│   └── firebaseConfig.ts   # Inisialisasi Firebase
└── app.json                # Konfigurasi Expo & API Keys
```

---

## 🚀 Instalasi & Menjalankan

Ikuti langkah ini untuk menjalankan proyek di lingkungan lokal Anda:

### 1. Prasyarat
Pastikan Anda telah menginstal:
*   [Node.js](https://nodejs.org/) (LTS Version)
*   Git
*   [Expo CLI](https://docs.expo.dev/get-started/installation/)

### 2. Clone Repository
```bash
git clone https://github.com/username/aira.git
cd aira
```

### 3. Instal Dependensi
```bash
npm install
# atau
yarn install
```

### 4. Konfigurasi API Keys
Buat file `.env` atau sesuaikan langsung di kode (tidak disarankan untuk produksi) untuk kunci API berikut:
*   **Google Maps API:** Aktifkan *Maps SDK for Android/iOS*, *Places API*, dan *Directions API* di Google Cloud Console.
    *   Lokasi config: `app.json` dan `(tabs)/index.tsx`.
*   **AviationStack API:** Dapatkan key untuk data penerbangan.
    *   Lokasi config: `(tabs)/index.tsx` dan `(tabs)/search.tsx`.
*   **Firebase:** Salin konfigurasi `google-services.json` / web config dari Firebase Console.
    *   Lokasi config: `services/firebaseConfig.ts`.

### 5. Jalankan Aplikasi
```bash
npx expo start
```
*   Tekan `a` di terminal untuk membuka di **Android Emulator**.
*   Tekan `i` untuk membuka di **iOS Simulator** (macOS).
*   Atau scan QR code menggunakan aplikasi **Expo Go** di perangkat fisik.

---

## ⚠️ Izin Akses (Permissions)

Aplikasi ini membutuhkan izin berikut agar berjalan optimal:
1.  **Lokasi (ACCESS_FINE_LOCATION):** Digunakan untuk fitur navigasi *turn-by-turn*, mencari bandara terdekat, dan menampilkan posisi pengguna di peta.
2.  **Internet:** Untuk sinkronisasi data dengan Firebase, Google Maps, dan AviationStack.

---

## 👨‍💻 Informasi Pengembang

Aplikasi ini dikembangkan sebagai bagian dari proyek **Praktikum Pemrograman Geospasial: Perangkat Bergerak Lanjut**.

*   **Nama:** Clisen Ardy Laksono Wicaksono
*   **NIM:** 23/517152/SV/22742
*   **Institusi:** Universitas Gadjah Mada
*   **Versi Aplikasi:** 1.0.0

---

## 📝 Lisensi

Proyek ini bersifat *Open Source* di bawah lisensi [MIT](LICENSE).

---

<p align="center">
  <i>Dibuat dengan ❤️ menggunakan React Native & Expo</i>
</p>
