# SIM Masjid Backend

Backend API untuk Sistem Informasi Manajemen Masjid (SIM Masjid).

## Teknologi
- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL Database

## Instalasi

1.  **Clone repository** (jika ada) atau masuk ke folder project.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Setup Database**:
    - Pastikan PostgreSQL sudah terinstall dan berjalan.
    - Buat database baru bernama `sim_masjid_db` (atau sesuai keinginan Anda).
    - Salin file `.env.example` ke `.env` (jika belum ada) dan sesuaikan konfigurasinya:
    ```
    DB_USER=postgres
    DB_PASSWORD=password_anda
    DB_NAME=sim_masjid_db
    DB_HOST=localhost
    ```

## Menjalankan Aplikasi

1. **Install Dependencies:**
    ```bash
    npm install
    ```

2. **Setup Database:**
    - Pastikan PostgreSQL sudah terinstall dan berjalan.
    - Buat database baru bernama `sim_masjid_db`.
    - Sesuaikan konfigurasi di file `.env`:
    ```
    DB_USER=postgres
    DB_PASSWORD=password_anda
    DB_NAME=sim_masjid_db
    DB_HOST=localhost
    ```

3. **Jalankan Migrasi:**
    ```bash
    npm run migrate
    npm run seed
    ```

4. **Jalankan Server:**
    - **Development Mode** (dengan nodemon):
    ```bash
    npm run dev
    ```
    - **Production Mode**:
    ```bash
    npm start
    ```

## Database Migrations

- **Run migrations**: `npm run migrate`
- **Undo last migration**: `npm run migrate:undo`
- **Undo all migrations**: `npm run migrate:undo:all`
- **Run seeders**: `npm run seed`

## Struktur Project

- `config/`: Konfigurasi database.
- `models/`: Definisi tabel database (Sequelize Models).
- `controllers/`: Logika bisnis.
- `routes/`: Routing API endpoints.
- `server.js`: Entry file.

## API Endpoints

### Authentication (Public)
- **POST** `/api/auth/register`: Registrasi user baru dengan data masjid
- **POST** `/api/auth/login`: Login user

### Authentication (Protected)
- **GET** `/api/auth/profile`: Get profile user yang sedang login
- **GET** `/api/auth/users/pending`: [Admin] List user pending verifikasi
- **GET** `/api/auth/users`: [Admin] List semua user
- **PUT** `/api/auth/users/:userId/verify`: [Admin] Verifikasi user

### Masjid (Protected)
- **GET** `/api/masjid`: Get semua masjid
- **POST** `/api/masjid`: Tambah masjid baru

### Aset Terbatas (Protected)
- **GET** `/api/aset-terbatas?masjid_id=1`: Get data aset terbatas
- **POST** `/api/aset-terbatas`: Tambah transaksi aset terbatas
- **GET** `/api/aset-terbatas/laporan?masjid_id=1`: Laporan per tujuan dana

### Aset Tidak Terbatas (Protected)
- **GET** `/api/aset-tidak-terbatas?masjid_id=1`: Get data aset tidak terbatas
- **POST** `/api/aset-tidak-terbatas`: Tambah transaksi aset tidak terbatas
- **GET** `/api/aset-tidak-terbatas/saldo?masjid_id=1`: Get saldo

## Default Admin Account
Setelah server pertama kali dijalankan, akun admin default akan dibuat:
- **Username**: admin
- **Password**: admin123
- **Email**: admin@simmasjid.com
