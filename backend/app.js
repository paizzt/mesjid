const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models');

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes - Define BEFORE static files
const authRoutes = require('./routes/authRoutes');
const masjidRoutes = require('./routes/masjidRoutes');
const kategoriRoutes = require('./routes/kategoriRoutes');
const asetTidakTerbatasRoutes = require('./routes/asetTidakTerbatasRoutes');
const asetTerbatasRoutes = require('./routes/asetTerbatasRoutes');
const kasRoutes = require('./routes/kasRoutes');
const laporanRoutes = require('./routes/laporan');
const jamaahRoutes = require('./routes/jamaahRoutes');
const zakatRoutes = require('./routes/zakatRoutes');
const qurbanRoutes = require('./routes/qurbanRoutes');
const tabunganQurbanRoutes = require('./routes/tabunganQurbanRoutes');
const agendaRoutes = require('./routes/agendaRoutes');
const pengumumanRoutes = require('./routes/pengumumanRoutes');
const inventarisRoutes = require('./routes/inventarisRoutes');
const publicRoutes = require('./routes/public');
const { authenticate } = require('./middleware/auth');

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/kategori', kategoriRoutes);
app.use('/api/public', publicRoutes);

// Protected routes (memerlukan authentication)
app.use('/api/masjid', authenticate, masjidRoutes);

// Aset routes (authentication applied per route)
app.use('/api/aset-tidak-terbatas', asetTidakTerbatasRoutes);
app.use('/api/aset-terbatas', asetTerbatasRoutes);

// Kas routes
app.use('/api/kas', kasRoutes);

// Laporan routes
app.use('/api/laporan', laporanRoutes);

// Jamaah routes
app.use('/api/jamaah', jamaahRoutes);

// Zakat routes
app.use('/api/zakat', zakatRoutes);

// Qurban routes
app.use('/api/qurban', qurbanRoutes);
app.use('/api/tabungan-qurban', tabunganQurbanRoutes);

// Masjid Operasional routes
app.use('/api/agenda', agendaRoutes);
app.use('/api/pengumuman', pengumumanRoutes);
app.use('/api/inventaris', inventarisRoutes);

// Serve static files from frontend dist folder (AFTER API routes)
app.use(express.static(path.join(__dirname, './dist')));

// SPA Fallback - Serve index.html for all non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './dist/index.html'));
});


module.exports = app;
