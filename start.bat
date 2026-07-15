@echo off
echo =========================================
echo Memulai Aplikasi SIM Masjid...
echo =========================================

echo Memeriksa instalasi dependensi backend...
cd backend
if not exist "node_modules\" (
    echo Dependensi backend belum terinstal. Sedang menginstal...
    call npm install
) else (
    echo Dependensi backend sudah terinstal.
)
cd ..

echo Memeriksa instalasi dependensi frontend...
cd frontend
if not exist "node_modules\" (
    echo Dependensi frontend belum terinstal. Sedang menginstal...
    call npm install
) else (
    echo Dependensi frontend sudah terinstal.
)
cd ..

echo =========================================
echo Menjalankan Server...
echo =========================================

echo Menjalankan Backend Server...
start "SIM Masjid - Backend" cmd /k "cd backend && npm start"

echo Menjalankan Frontend Server...
start "SIM Masjid - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Selesai! Kedua server sedang berjalan di jendela baru.
echo Anda dapat menutup jendela ini.
