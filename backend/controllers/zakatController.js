const { Zakat, Masjid } = require('../models');

// Ambil semua data zakat berdasarkan masjid dan tahun hijriah
exports.getAllZakat = async (req, res) => {
    try {
        const { masjid_id, tahun_hijriah } = req.query;
        let whereClause = {};
        
        if (masjid_id) whereClause.MasjidId = masjid_id;
        if (tahun_hijriah) whereClause.tahun_hijriah = tahun_hijriah;

        const zakatList = await Zakat.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });

        // Calculate summary
        const summary = {
            totalFitrahUang: 0,
            totalFitrahBeras: 0,
            totalMalUang: 0,
            totalJiwaFitrah: 0
        };

        zakatList.forEach(z => {
            const nominalUang = parseFloat(z.nominal_uang) || 0;
            const literBeras = parseFloat(z.liter_beras) || 0;
            
            if (z.jenis_zakat === 'fitrah') {
                summary.totalJiwaFitrah += (z.jumlah_jiwa || 1);
                if (z.bentuk_bayar === 'uang') summary.totalFitrahUang += nominalUang;
                if (z.bentuk_bayar === 'beras') summary.totalFitrahBeras += literBeras;
            } else if (z.jenis_zakat === 'mal') {
                summary.totalMalUang += nominalUang;
            }
        });
        
        res.json({ data: zakatList, summary });
    } catch (error) {
        console.error('Error getting zakat:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

// Tambah data zakat baru
exports.createZakat = async (req, res) => {
    try {
        const { tahun_hijriah, nama_muzakki, jenis_zakat, bentuk_bayar, jumlah_jiwa, nominal_uang, liter_beras, MasjidId } = req.body;

        if (!nama_muzakki || !MasjidId || !tahun_hijriah) {
            return res.status(400).json({ message: 'Nama muzakki, tahun hijriah, dan MasjidId wajib diisi' });
        }

        const newZakat = await Zakat.create({
            tahun_hijriah,
            nama_muzakki,
            jenis_zakat,
            bentuk_bayar,
            jumlah_jiwa: jenis_zakat === 'fitrah' ? jumlah_jiwa : null,
            nominal_uang: bentuk_bayar === 'uang' || jenis_zakat === 'mal' ? nominal_uang : 0,
            liter_beras: bentuk_bayar === 'beras' && jenis_zakat === 'fitrah' ? liter_beras : 0,
            MasjidId
        });

        res.status(201).json(newZakat);
    } catch (error) {
        console.error('Error creating zakat:', error);
        res.status(500).json({ message: 'Gagal menambahkan data zakat' });
    }
};

// Update data zakat
exports.updateZakat = async (req, res) => {
    try {
        const { id } = req.params;
        const { tahun_hijriah, nama_muzakki, jenis_zakat, bentuk_bayar, jumlah_jiwa, nominal_uang, liter_beras } = req.body;

        const zakat = await Zakat.findByPk(id);
        
        if (!zakat) {
            return res.status(404).json({ message: 'Data zakat tidak ditemukan' });
        }

        await zakat.update({
            tahun_hijriah,
            nama_muzakki,
            jenis_zakat,
            bentuk_bayar,
            jumlah_jiwa: jenis_zakat === 'fitrah' ? jumlah_jiwa : null,
            nominal_uang: bentuk_bayar === 'uang' || jenis_zakat === 'mal' ? nominal_uang : 0,
            liter_beras: bentuk_bayar === 'beras' && jenis_zakat === 'fitrah' ? liter_beras : 0
        });

        res.json(zakat);
    } catch (error) {
        console.error('Error updating zakat:', error);
        res.status(500).json({ message: 'Gagal mengupdate data zakat' });
    }
};

// Hapus data zakat
exports.deleteZakat = async (req, res) => {
    try {
        const { id } = req.params;
        const zakat = await Zakat.findByPk(id);

        if (!zakat) {
            return res.status(404).json({ message: 'Data zakat tidak ditemukan' });
        }

        await zakat.destroy();
        res.json({ message: 'Data zakat berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting zakat:', error);
        res.status(500).json({ message: 'Gagal menghapus data zakat' });
    }
};
