<div align="center">
  <img src="./assets/images/icon.png" alt="AIRA Logo" width="120" height="120" />
  
  <h1>AIRA</h1>
  <h3>Aplikasi Pelacak Penerbangan & Navigasi Terintegrasi</h3>
  
  <p>
    <a href="https://expo.dev">
      <img src="https://img.shields.io/badge/Expo-SDK_52-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo SDK" />
    </a>
    <a href="https://reactnative.dev">
      <img src="https://img.shields.io/badge/React_Native-0.76-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    </a>
    <a href="https://firebase.google.com/">
      <img src="https://img.shields.io/badge/Firebase-Auth_%26_Database-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
    </a>
    <a href="https://mapsplatform.google.com/">
      <img src="https://img.shields.io/badge/Google_Maps-Platform-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white" alt="Google Maps" />
    </a>
    <a href="https://aviationstack.com/">
      <img src="https://img.shields.io/badge/Data-AviationStack_API-F05032?style=for-the-badge&logo=airplane&logoColor=white" alt="AviationStack" />
    </a>
</p>
</div>

---

> **AIRA** adalah aplikasi *mobile* berbasis React Native (Expo) yang dirancang untuk memantau informasi penerbangan secara *real-time*, mencari lokasi bandara global, serta menyediakan sistem navigasi darat (*turn-by-turn navigation*) yang terintegrasi langsung di dalam aplikasi tanpa perlu berpindah ke aplikasi peta lain.

---

## 📋 Daftar Isi

1. [Latar Belakang Proyek](#-latar-belakang-proyek)
2. [Fitur Unggulan](#-fitur-unggulan)
3. [Arsitektur & Logika Sistem](#-arsitektur--logika-sistem)
4. [Struktur Folder](#-struktur-folder)
5. [Struktur Database](#-struktur-database)
6. [Spesifikasi Teknis](#-spesifikasi-teknis)
7. [Instalasi & Penggunaan](#-instalasi--penggunaan)
8. [Kredit Pengembang](#-kredit-pengembang)

---

## 📖 Latar Belakang Proyek

Dalam perjalanan udara, seringkali terdapat diskoneksi antara informasi penerbangan dan mobilitas menuju bandara. AIRA dikembangkan untuk menjembatani celah tersebut. Aplikasi ini menyelesaikan masalah perpindahan aplikasi (*app switching*) dengan menyatukan fitur pencarian jadwal penerbangan, visualisasi rute udara, dan navigasi darat menuju bandara dalam satu antarmuka yang kohesif dan modern.

---

## 🌟 Fitur Unggulan

### 1. 🗺️ Sistem Navigasi Cerdas (Smart Navigation)
- **Turn-by-Turn Guidance:** Memberikan instruksi manuver (belok kiri/kanan), estimasi waktu, dan sisa jarak secara *real-time*.
- **Polyline Decoding:** Menerjemahkan data rute terenkripsi dari Google Directions API menjadi jalur visual presisi di peta.
- **Auto Re-routing Logic:** Mendeteksi posisi pengguna secara *live* dan memperbarui instruksi langkah demi langkah secara otomatis.
- **Dynamic Camera:** Kamera peta otomatis mengikuti arah hadap pengguna (*heading/compass mode*) dan menyesuaikan sudut pandang (*pitch*) saat mode berkendara aktif.

### 2. ✈️ Pelacakan Penerbangan & Bandara
- **Live Flight Data:** Integrasi penuh dengan **AviationStack API** untuk menampilkan status penerbangan terkini (Scheduled, Active, Landed, Cancelled).
- **Airport Discovery:** Menggunakan **Google Places API** untuk mencari dan menampilkan lokasi bandara di seluruh dunia beserta detail alamatnya.
- **Visualisasi Rute Udara:** Menggambar garis geodesik melengkung antara bandara asal dan tujuan untuk visualisasi rute terbang yang realistis.

### 3. 💾 Personalisasi & Sinkronisasi Cloud
- **Rencana Penerbangan:** Menyimpan jadwal penerbangan favorit ke **Firebase Realtime Database**.
- **Cross-Device Sync:** Data tersimpan di *cloud*, memungkinkan akses konsisten dari perangkat berbeda.
- **Manajemen Jadwal:** Pengguna dapat mengedit detail penerbangan atau menghapus jadwal yang sudah tidak relevan.
- **Manajemen Profil:** Fitur lengkap untuk mengedit profil, mengubah kata sandi, hingga penghapusan akun permanen (*destructive action*) yang membersihkan data autentikasi dan database sekaligus.

### 4. 🔐 Keamanan & Autentikasi
- **Secure Auth Flow:** Penanganan sesi pengguna dengan `onAuthStateChanged` untuk perlindungan rute (*Route Guarding*) yang ketat.
- **Validasi Berlapis:** Pengecekan kekuatan kata sandi, format email valid, dan re-autentikasi (login ulang) saat pengguna melakukan perubahan data sensitif.

---

## 🧠 Arsitektur & Logika Sistem

### 1. Logika Navigasi Darat (Driving Mode)
Logika ini terdapat pada file `app/(tabs)/index.tsx`.
*   **Inisiasi:** Saat pengguna memilih "Mulai Navigasi", aplikasi mengambil koordinat GPS pengguna (`Location.getCurrentPositionAsync`) sebagai titik awal dan koordinat bandara sebagai tujuan.
*   **Routing API:** Aplikasi mengirim *request* ke Google Directions API.
*   **Decoding:** Respons API berupa string enkripsi *polyline* didecode menggunakan algoritma bitwise menjadi array koordinat `[{lat, lng}, ...]` untuk digambar sebagai garis rute pada peta.
*   **Step Logic:** Rute dipecah menjadi *steps* (langkah instruksi). Aplikasi memantau jarak pengguna ke titik akhir *step* saat ini menggunakan rumus Haversine. Jika jarak < 40 meter, instruksi UI diperbarui ke *step* berikutnya secara otomatis.

### 2. Autentikasi & Route Guarding
Logika ini terdapat pada file `app/_layout.tsx`.
*   Aplikasi menggunakan listener `onAuthStateChanged` dari Firebase.
*   **Middleware Logic:**
    *   Jika status User `null` dan pengguna berada di dalam grup `(tabs)`, sistem memaksa navigasi ke `(auth)/login`.
    *   Jika status User `ada` dan pengguna berada di grup `(auth)`, sistem memaksa navigasi ke `(tabs)`.
*   Ini mencegah akses tidak sah ke fitur utama aplikasi dan memastikan pengalaman pengguna yang mulus.

### 3. Integrasi Data (Search & Save)
*   **Pencarian (`search.tsx`):**
    *   Menggunakan **AviationStack API** untuk mengambil data penerbangan *real-time* berdasarkan kode IATA atau nomor penerbangan.
    *   Menggunakan **Google Places API** untuk pencarian lokasi bandara.
*   **Penyimpanan (`saved.tsx`):** Data disimpan di Cloud. Struktur data menggunakan UID pengguna sebagai *parent node* (`users/{uid}/favorites`) untuk memastikan privasi dan keamanan data antar pengguna.

---

## 📂 Struktur Folder

Struktur proyek disusun menggunakan pola **Expo Router** (file-based routing) yang modern:

```text
AIRA/
├── assets/                  # Aset statis aplikasi
│   ├── fonts/               # Font Poppins (Regular, Bold, etc.)
│   └── images/              # Icon aplikasi (icon.png), splash screen
├── components/
│   └── ui/
│       └── CustomAlert.tsx  # Komponen Modal Alert reusable (Success/Error/Info)
├── constants/
│   └── Colors.ts            # Definisi palet warna tema (Light/Dark)
├── services/
│   └── firebaseConfig.ts    # Konfigurasi & inisialisasi Firebase Auth & DB
├── app/                     # Folder utama Routing
│   ├── (auth)/              # Group Autentikasi
│   │   ├── _layout.tsx      # Layout Stack Auth
│   │   ├── login.tsx        # Layar Login
│   │   └── register.tsx     # Layar Registrasi
│   ├── (tabs)/              # Group Navigasi Utama (Bottom Tabs)
│   │   ├── _layout.tsx      # Konfigurasi Tab Bar
│   │   ├── index.tsx        # [CORE] Layar Peta & Navigasi
│   │   ├── search.tsx       # Layar Pencarian
│   │   ├── saved.tsx        # Layar Tersimpan
│   │   └── profile.tsx      # Layar Profil
│   ├── _layout.tsx          # Root Layout (Provider, Font, Auth Check)
│   ├── about.tsx            # Halaman Tentang Aplikasi
│   ├── delete-account.tsx   # Logika Hapus Akun
│   ├── edit-profile.tsx     # Logika Edit Profil
│   ├── edit-saved.tsx       # Logika Edit Jadwal
│   └── modal.tsx            # Halaman Modal
├── app.json                 # Konfigurasi Expo & API Keys
└── tsconfig.json            # Konfigurasi TypeScript
```

---

## 🗄️ Struktur Database

Aplikasi menggunakan **Firebase Realtime Database** dengan struktur JSON Tree sebagai berikut:

```json
{
  "users": {
    "USER_UID_12345": {
      "profile": {
        "username": "Clisen Ardy",
        "email": "clisen@example.com",
        "role": "user",
        "createdAt": "2025-01-01T10:00:00.000Z"
      },
      "favorites": {
        "-O9aBcDeFgHiJkLmNoP": {
          "flightNumber": "GA-404",
          "airline": "Garuda Indonesia",
          "time": "14:00",
          "origin": {
            "code": "CGK",
            "city": "Jakarta",
            "lat": -6.1256,
            "lng": 106.6558
          },
          "destination": {
            "code": "DPS",
            "city": "Denpasar",
            "lat": -8.7482,
            "lng": 115.1672
          },
          "savedAt": "2025-01-02T08:30:00.000Z"
        }
      }
    }
  }
}
```

---

## 🛠️ Spesifikasi Teknis

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Framework** | React Native (Expo) | Menggunakan *New Architecture* Enabled |
| **Routing** | Expo Router v3 | Navigasi berbasis file yang modern (mirip Next.js) |
| **State Mgmt** | React Hooks | Menggunakan `useState`, `useEffect`, `useRef` |
| **Database** | Firebase Realtime DB | NoSQL database untuk data struktur JSON tree |
| **Auth** | Firebase Authentication | Provider Email/Password |
| **Flight API** | **AviationStack** | Provider data status penerbangan real-time |
| **Maps API** | **Google Maps Platform** | Maps SDK (Android/iOS), Directions API, Places API |
| **Icons** | Lucide React Native | Set ikon vektor yang konsisten, ringan, dan modern |
| **Font** | Google Fonts (Poppins) | Dimuat secara asinkron via `expo-font` |

---

## 🚀 Instalasi & Penggunaan

Ikuti langkah-langkah berikut untuk menjalankan proyek di lingkungan pengembangan lokal:

1.  **Clone Repository**
    ```bash
    git clone https://github.com/Clis3n/aira.git
    cd aira
    ```

2.  **Instal Dependensi**
    ```bash
    npm install
    # atau
    npx expo install
    ```

3.  **Konfigurasi Environment**
    *   Pastikan Anda memiliki file `services/firebaseConfig.ts` dengan kredensial Firebase Anda.
    *   Pastikan `app.json` memiliki Google Maps API Key yang valid pada bagian `android.config.googleMaps.apiKey`.

4.  **Jalankan Aplikasi**
    ```bash
    npx expo start
    ```
    *   Tekan `a` untuk membuka di Android Emulator.
    *   Tekan `s` untuk beralih ke Expo Go (Scan QR Code di HP fisik).

---

## 👨‍💻 Kredit Pengembang

Aplikasi ini dikembangkan sebagai bagian dari tugas praktikum pemrograman perangkat bergerak lanjut.

*   **Nama:** Clisen Ardy Laksono Wicaksono
*   **NIM:** 23/517152/SV/22742
*   **Program Studi:** Sistem Informasi Geografis
*   **Mata Kuliah:** Praktikum Pemrograman Geospasial: Perangkat Bergerak Lanjut

---

<div align="center">
  <small>© 2025 AIRA Project. All Rights Reserved.</small>
</div>
