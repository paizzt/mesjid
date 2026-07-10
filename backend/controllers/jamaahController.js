const { Jamaah, Masjid } = require('../models');

// Ambil semua data jamaah berdasarkan masjid
exports.getAllJamaah = async (req, res) => {
    try {
        const { masjid_id } = req.query;
        let whereClause = {};
        
        if (masjid_id) {
            whereClause.MasjidId = masjid_id;
        }

        const jamaahList = await Jamaah.findAll({
            where: whereClause,
            order: [['nama_lengkap', 'ASC']]
        });
        
        res.json(jamaahList);
    } catch (error) {
        console.error('Error getting jamaah:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

// Tambah data jamaah baru
exports.createJamaah = async (req, res) => {
    try {
        const { nik, nama_lengkap, jenis_kelamin, no_hp, alamat, status_pernikahan, pekerjaan, MasjidId } = req.body;

        if (!nama_lengkap || !MasjidId) {
            return res.status(400).json({ message: 'Nama lengkap dan MasjidId wajib diisi' });
        }

        const newJamaah = await Jamaah.create({
            nik,
            nama_lengkap,
            jenis_kelamin,
            no_hp,
            alamat,
            status_pernikahan,
            pekerjaan,
            MasjidId
        });

        res.status(201).json(newJamaah);
    } catch (error) {
        console.error('Error creating jamaah:', error);
        res.status(500).json({ message: 'Gagal menambahkan data jamaah' });
    }
};

// Update data jamaah
exports.updateJamaah = async (req, res) => {
    try {
        const { id } = req.params;
        const { nik, nama_lengkap, jenis_kelamin, no_hp, alamat, status_pernikahan, pekerjaan } = req.body;

        const jamaah = await Jamaah.findByPk(id);
        
        if (!jamaah) {
            return res.status(404).json({ message: 'Data jamaah tidak ditemukan' });
        }

        await jamaah.update({
            nik,
            nama_lengkap,
            jenis_kelamin,
            no_hp,
            alamat,
            status_pernikahan,
            pekerjaan
        });

        res.json(jamaah);
    } catch (error) {
        console.error('Error updating jamaah:', error);
        res.status(500).json({ message: 'Gagal mengupdate data jamaah' });
    }
};

// Hapus data jamaah
exports.deleteJamaah = async (req, res) => {
    try {
        const { id } = req.params;
        const jamaah = await Jamaah.findByPk(id);

        if (!jamaah) {
            return res.status(404).json({ message: 'Data jamaah tidak ditemukan' });
        }

        await jamaah.destroy();
        res.json({ message: 'Data jamaah berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting jamaah:', error);
        res.status(500).json({ message: 'Gagal menghapus data jamaah' });
    }
};
