const bcrypt = require('bcryptjs');
const db = require('./models');

async function seed() {
    try {
        console.log('Menghubungkan ke database dan melakukan sync...');
        await db.sequelize.sync({ force: true });
        
        console.log('Membuat password hash...');

        console.log('Membuat password hash...');
        const salt = await bcrypt.genSalt(10);
        // User requested password: '0895333660777' for testing
        const hashedPassword = await bcrypt.hash('0895333660777', salt);

        console.log('Membuat akun pengguna (3 Roles)...');
        const takmir = await db.User.create({
            username: 'takmir',
            nama_lengkap: 'Reza Maulana (Takmir)',
            email: 'saya@rezamaulana.com',
            password: hashedPassword,
            role: 'takmir',
            status_verifikasi: 'approved'
        });

        const bendahara = await db.User.create({
            username: 'bendahara',
            nama_lengkap: 'Reza Maulana (Bendahara)',
            email: 'bendahara@rezamaulana.com',
            password: hashedPassword,
            role: 'bendahara',
            status_verifikasi: 'approved'
        });

        const jamaah = await db.User.create({
            username: 'jamaah',
            nama_lengkap: 'Reza Maulana (Jamaah)',
            email: 'jamaah@rezamaulana.com',
            password: hashedPassword,
            role: 'jamaah',
            status_verifikasi: 'approved'
        });

        console.log('Membuat data Masjid Utama...');
        const masjid = await db.Masjid.create({
            nama_masjid: 'Masjid Agung Sultan Alauddin',
            alamat: 'Makassar',
            UserId: takmir.id // Dikaitkan dengan takmir
        });

        console.log('Membuat master data Akun Kas...');
        await db.AkunKas.bulkCreate([
            { nama_akun: 'Kas Tunai', tipe_akun: 'tunai', saldo: 0, MasjidId: masjid.id },
            { nama_akun: 'Kas Bank BSI', tipe_akun: 'bank', saldo: 0, MasjidId: masjid.id },
            { nama_akun: 'Kas Infaq/Zakat', tipe_akun: 'bank', saldo: 0, MasjidId: masjid.id }
        ]);

        console.log('Membuat master data Kategori...');
        await db.Kategori.bulkCreate([
            { tipe: 'pemasukan', jenis_aset: 'tidak_terbatas', nama_kategori: 'Infaq Jumat', is_active: true },
            { tipe: 'pemasukan', jenis_aset: 'tidak_terbatas', nama_kategori: 'Infaq Bebas', is_active: true },
            { tipe: 'pemasukan', jenis_aset: 'tidak_terbatas', nama_kategori: 'Donasi Operasional', is_active: true },
            { tipe: 'pengeluaran', jenis_aset: 'tidak_terbatas', nama_kategori: 'Biaya Kebersihan', is_active: true },
            { tipe: 'pengeluaran', jenis_aset: 'tidak_terbatas', nama_kategori: 'Biaya Listrik & Air', is_active: true },
            { tipe: 'pengeluaran', jenis_aset: 'tidak_terbatas', nama_kategori: 'Honor Khatib & Imam', is_active: true },
            { tipe: 'pemasukan', jenis_aset: 'terbatas', nama_kategori: 'Penerimaan Zakat Fitrah', is_active: true },
            { tipe: 'pemasukan', jenis_aset: 'terbatas', nama_kategori: 'Penerimaan Qurban', is_active: true },
            { tipe: 'pengeluaran', jenis_aset: 'terbatas', nama_kategori: 'Penyaluran Zakat', is_active: true },
            { tipe: 'pengeluaran', jenis_aset: 'terbatas', nama_kategori: 'Biaya Penyelenggaraan Qurban', is_active: true }
        ]);

        console.log('✅ Seeding Selesai! Data awal berhasil dimasukkan.');
        console.log(`
--- KREDENSIAL LOGIN (Password: 0895333660777) ---
1. Takmir: saya@rezamaulana.com
2. Bendahara: bendahara@rezamaulana.com
3. Jamaah: jamaah@rezamaulana.com
--------------------------------------------------
        `);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error saat proses seeding:', error);
        process.exit(1);
    }
}

seed();
