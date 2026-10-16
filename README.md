# ⚡ DeskFlow - Kendali Desktop Windows dari iPhone

Aplikasi kontrol remote Windows modern berbasis **Web PWA** dan **WebSocket**. Anda dapat mengendalikan kursor mouse, keyboard, media, shortcut, hingga melihat layar desktop secara real-time langsung dari iPhone Anda **tanpa perlu menginstal aplikasi apapun dari App Store**!

---

## 📱 Fitur Utama

1. **🖱️ Virtual Magic Trackpad**:
   - **Geser 1 jari**: Gerakkan kursor mouse dengan akselerasi halus & responsif.
   - **Ketuk 1 jari**: Klik kiri (*Left Click*).
   - **Ketuk 2 jari**: Klik kanan (*Right Click / Context Menu*).
   - **Geser 2 jari**: Scroll vertikal & horizontal (*Smooth Scrolling*).
   - **Tombol fisik**: Klik Kiri, Klik Kanan, Double Click, dan Tombol **🔒 Drag Lock** untuk memindahkan jendela/file.
   - **Slider Sensitivitas**: Atur kecepatan pergerakan kursor sesuai kenyamanan.

2. **🖥️ Live Screen Mirror & Direct Touch**:
   - Streaming layar PC secara langsung ke layar iPhone (*Low Latency MJPEG*).
   - **Direct Touch**: Ketuk langsung di bagian layar mana saja pada iPhone untuk mengklik koordinat tersebut di PC secara presisi.
   - **📺 Mode Frameless (Borderless Fullscreen)**: Tampilan layar monitor ujung-ke-ujung (*edge-to-edge*) tanpa frame, dilengkapi Dynamic Island kontrol cepat, trigger klik jempol kiri & kanan, strip scroll samping, dan keyboard drawer cepat.
   - Tombol tangkapan layar cepat (*Instant Snapshot*).

3. **📑 Pemilih & Pengalih Jendela Aktif (Window Switcher)**:
   - Melihat daftar semua jendela aplikasi yang sedang terbuka di PC secara real-time (Chrome, VS Code, Spotify, Discord, Explorer, dll).
   - **Buka & Aktifkan**: Bawa jendela yang diinginkan langsung ke latar depan (*foreground focus*) dan un-minimize secara instan.
   - **Kontrol Cepat Jendela**: Tombol Maksimumkan (`⛶`), Minimalkan (`🗕`), dan Tutup Jendela (`✕`).
   - **Pencarian Real-Time**: Ketik nama aplikasi atau judul dokumen untuk memfilter jendela aktif seketika.
   - **Quick Switcher di Mode Frameless**: Tombol `📑 Jendela` di Dynamic Island memungkinkan berpindah aplikasi tanpa harus keluar dari mode layar penuh.

4. **⌨️ Virtual Keyboard & Windows Shortcuts**:
   - Ketik teks apa saja (termasuk emoji & teks panjang) dan kirim langsung ke PC.
   - Shortcut produktivitas Windows:
     - `Ctrl+C` (Salin), `Ctrl+V` (Tempel), `Ctrl+Z` (Undo), `Ctrl+A` (Pilih Semua).
     - `Win+D` (Tampilkan Desktop / Minimize Semua Jendela).
     - `Alt+Tab` (Ganti Aplikasi), `Win+V` (Clipboard History).
     - `📸 Screenshot` (`Win + Shift + S` Snipping Tool).
     - `⚡ Task Manager` (`Ctrl + Shift + Esc`).
   - D-Pad navigasi panah (`▲`, `▼`, `◄`, `►`), `Enter`, `Spasi`, `Esc`, `Tab`.

5. **🎛️ Media Player & Kontrol Daya**:
   - Kontrol Musik/Video: *Play/Pause*, *Lagu Berikutnya*, *Lagu Sebelumnya*.
   - Kontrol Volume: *Volume +*, *Volume -*, *Mute*.
   - Peluncur Cepat: Buka *File Explorer*, *Run Dialog*, dll.
   - Daya & Keamanan: *Kunci PC (Lock)*, *Sleep*, serta dialog konfirmasi aman untuk *Restart* dan *Shutdown*.

6. **📱 Tampilkan Layar HP ke Monitor Desktop (Phone to PC Mirror)**:
   - **Streaming Real-Time**: Bagikan seluruh layar smartphone (Android) atau kamera HP HD (iPhone/Android) langsung ke monitor desktop Windows secara real-time (*P2P WebRTC 60 FPS + WebSocket fallback*).
   - **Jendela Melayang Otomatis (App Mode)**: Cukup ketuk *"Buka di Monitor PC"* di HP, maka jendela penampil layar HP akan langsung muncul di monitor Windows tanpa browser tab yang mengganggu!
   - **Kontrol Lengkap di Monitor**:
     - 🔄 **Putar Layar**: Orientasi 0°, 90°, 180°, 270° (cocok untuk game landscape / media).
     - 📱 **Mode Bezel HP / Borderless**: Pilihan bingkai smartphone elegan atau layar murni tanpa bingkai (*frameless*).
     - 🪟 **Picture-in-Picture (PiP)**: Buat layar HP melayang di atas semua aplikasi Windows lain saat mengetik atau coding.
     - 📸 **Tangkapan Layar Instan**: Ambil foto snapshot resolusi penuh dari layar HP dan salin langsung ke clipboard Windows atau simpan PNG.
     - 🎥 **Perekaman Layar HP**: Rekam tampilan video HP langsung ke file video `.webm` di PC.
     - 🔊 **Audio Mirroring**: Dengarkan suara game/media HP dari speaker PC monitor.

---

## 🚀 Cara Menjalankan

### 1. Jalankan di Komputer (Windows)
Cukup jalankan file batch:
```cmd
start.bat
```
Atau via terminal:
```cmd
python server.py
```

Server akan langsung menampilkan IP lokal dan QR Code di terminal:
```text
================================================================
       DESKFLOW - KONTROL DESKTOP WINDOWS DARI IPHONE        
================================================================
[*] Local PC    : http://localhost:8000
[*] URL iPhone  : http://192.168.100.178:8000
[*] QR Code File: qr_code.png
----------------------------------------------------------------
```

### 2. Hubungkan dari iPhone
1. Pastikan iPhone dan PC terhubung ke **jaringan Wi-Fi yang sama**.
2. Buka aplikasi **Kamera** di iPhone, lalu arahkan ke QR Code di layar PC Anda, **ATAU** buka **Safari** lalu ketik alamat IP yang tertera (contoh: `http://192.168.100.178:8000`).

### 3. Jadikan Layar Penuh (Seperti Aplikasi Asli)
Agar tidak terganggu oleh address bar Safari:
1. Di Safari iPhone, ketuk ikon **Share (Bagikan)** di bagian bawah (kotak dengan tanda panah ke atas).
2. Gulir ke bawah lalu pilih **"Add to Home Screen" (Tambahkan ke Layar Utama)**.
3. Ketuk **Add (Tambah)**.
4. Sekarang Anda memiliki ikon **DeskFlow** di layar utama iPhone yang akan terbuka dalam mode layar penuh (*full-screen PWA*)!

### 4. Menampilkan Layar HP ke Monitor Desktop (Phone to PC)
1. Di HP Anda, buka tab **📱 Layar HP**.
2. Pilih sumber: **Seluruh Layar HP** (Android) atau **Kamera Belakang / Depan** (iPhone & Android).
3. Ketuk **🚀 Mulai Bagikan Layar HP**.
4. Di komputer, jendela penampil melayang akan otomatis terbuka, atau Anda dapat membuka file:
   ```cmd
   view_phone.bat
   ```
   Atau buka browser di PC: `http://localhost:8000/phone-screen`.
5. Layar HP Anda kini tampil secara real-time dan jernih di monitor desktop!

---

## 🛠️ Persyaratan Sistem
- **Sistem Operasi**: Windows 10 / 11
- **Python**: Versi 3.10 ke atas
- **Library**: `fastapi`, `uvicorn`, `websockets`, `mss`, `pillow`, `qrcode` (sudah terinstal otomatis)

---

## 💡 Tips & Troubleshooting

- **iPhone tidak bisa memuat halaman?**
  - Pastikan PC dan iPhone berada pada Wi-Fi/Hotspot yang sama.
  - Jika Windows Firewall memblokir port 8000, beri izin (*Allow*) ketika muncul notifikasi Windows Defender Firewall, atau jalankan perintah PowerShell ini (sebagai Administrator):
    ```powershell
    New-NetFirewallRule -DisplayName "DeskFlow Remote" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
    ```
