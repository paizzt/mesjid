# Panduan Instalasi dan Penggunaan SIM Masjid (SIMAD)

Dokumen ini berisi panduan teknis bagi pengguna baru untuk menginstal, menjalankan, dan mengatasi masalah pada sistem SIM Masjid. Harap ikuti langkah-langkah di bawah ini secara berurutan.

## Persyaratan Sistem

Sebelum menjalankan aplikasi ini, pastikan komputer Anda telah memenuhi persyaratan berikut:
1. Node.js (Minimal versi 18.x atau yang lebih baru).
2. XAMPP (Jika Anda menggunakan database MySQL lokal, meskipun saat ini aplikasi menggunakan SQLite bawaan).
3. Git (Opsional, untuk mengambil pembaruan kode terbaru).

## Langkah-langkah Menjalankan Aplikasi

Aplikasi ini dilengkapi dengan skrip otomatis (start.bat) yang akan menangani proses instalasi modul dan menjalankan server untuk Anda.

1. Buka folder utama proyek ini (sim_masjid-main) menggunakan File Explorer.
2. Cari file bernama "start.bat" di dalam folder tersebut.
3. Klik ganda (Double-click) pada file "start.bat".
4. Sebuah jendela terminal (Command Prompt) akan terbuka. Sistem akan secara otomatis:
   - Memeriksa apakah direktori "backend" dan "frontend" sudah memiliki "node_modules".
   - Mengunduh dan menginstal semua paket perangkat lunak yang dibutuhkan jika belum terinstal (proses ini memerlukan koneksi internet dan waktu beberapa menit).
   - Menjalankan backend server pada port 3000.
   - Menjalankan frontend server (Vite) pada port standar (umumnya 5173).
5. Setelah muncul teks "Selesai! Kedua server sedang berjalan di jendela baru", dua jendela Command Prompt hitam akan terus terbuka. Biarkan kedua jendela tersebut tetap berjalan.
6. Buka browser web Anda (disarankan Google Chrome atau Microsoft Edge) dan ketikkan alamat:
   http://localhost:5173
7. Halaman Login SIMAD akan terbuka. Gunakan akun berikut untuk masuk:
   **Akun Takmir:**
   - Email: takmir@gmail.com
   - Password: 12345678

   **Akun Bendahara:**
   - Email: bendahara@gmail.com
   - Password: 12345678


## Panduan Penyelesaian Masalah (Troubleshooting)

Apabila aplikasi gagal berjalan, periksa daftar pesan eror di bawah ini dan ikuti solusinya.

### 1. Pesan Eror: "npm is not recognized as an internal or external command"
- Penyebab: Komputer Anda belum menginstal Node.js, atau Node.js belum didaftarkan pada Environment Variables sistem Windows Anda.
- Solusi: 
  - Unduh Node.js dari situs resminya (https://nodejs.org/).
  - Instal Node.js dan pastikan opsi "Add to PATH" tercentang selama proses instalasi.
  - Setelah selesai, tutup semua jendela Command Prompt yang terbuka dan jalankan kembali "start.bat".

### 2. Pesan Eror: "Port 3000 is already in use" atau Backend Server Tertutup Tiba-tiba
- Penyebab: Aplikasi lain di komputer Anda sedang menggunakan port 3000 (port yang digunakan oleh backend server).
- Solusi:
  - Buka Task Manager (Ctrl + Shift + Esc).
  - Cari proses bernama "Node.js" dan hentikan paksa proses tersebut (End Task).
  - Jalankan kembali "start.bat".

### 3. Pesan Eror: "Cannot find module..." saat backend atau frontend dijalankan
- Penyebab: Proses instalasi ("npm install") pada script "start.bat" gagal atau terhenti di tengah jalan karena koneksi internet putus.
- Solusi:
  - Masuk ke dalam folder "backend", lalu hapus folder bernama "node_modules".
  - Masuk ke dalam folder "frontend", lalu hapus folder bernama "node_modules" di dalamnya.
  - Pastikan koneksi internet Anda stabil.
  - Jalankan kembali "start.bat" dari folder utama untuk mengulangi proses instalasi.

### 4. Browser Menampilkan Layar Kosong (Blank Screen) / Error Vite
- Penyebab: File inti aplikasi mengalami kerusakan cache atau build proses belum selesai sepenuhnya saat dibuka.
- Solusi:
  - Tutup tab browser tersebut.
  - Pada jendela terminal Frontend Server, tekan "Ctrl + C", kemudian ketik "Y" dan tekan Enter untuk mematikan server.
  - Ketik perintah "npm run dev" dan tekan Enter.
  - Buka kembali tautan yang muncul pada terminal (biasanya http://localhost:5173).

## Menghentikan Aplikasi
Jika Anda sudah selesai menggunakan aplikasi dan ingin mematikannya, Anda cukup menutup (mengklik tanda X merah) pada dua jendela Command Prompt yang menjalankan backend dan frontend.
