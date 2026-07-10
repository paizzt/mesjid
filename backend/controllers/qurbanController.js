const { QurbanHewan, QurbanPeserta, Masjid } = require('../models');

// Qurban Hewan Controllers
exports.getAllHewan = async (req, res) => {
    try {
        const { masjid_id, tahun_hijriah } = req.query;
        let whereClause = {};
        if (masjid_id) whereClause.MasjidId = masjid_id;
        if (tahun_hijriah) whereClause.tahun_hijriah = tahun_hijriah;

        const hewanList = await QurbanHewan.findAll({
            where: whereClause,
            include: [{ model: QurbanPeserta, as: 'peserta' }],
            order: [['createdAt', 'DESC']]
        });
        
        res.json(hewanList);
    } catch (error) {
        console.error('Error getting hewan qurban:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

exports.createHewan = async (req, res) => {
    try {
        const { tahun_hijriah, jenis_hewan, tipe, harga, status, MasjidId } = req.body;
        if (!tahun_hijriah || !jenis_hewan || !MasjidId) {
            return res.status(400).json({ message: 'Data tidak lengkap' });
        }
        
        const hewan = await QurbanHewan.create({ tahun_hijriah, jenis_hewan, tipe, harga, status, MasjidId });
        res.status(201).json(hewan);
    } catch (error) {
        console.error('Error creating hewan qurban:', error);
        res.status(500).json({ message: 'Gagal menambahkan hewan qurban' });
    }
};

exports.updateHewan = async (req, res) => {
    try {
        const { id } = req.params;
        const hewan = await QurbanHewan.findByPk(id);
        if (!hewan) return res.status(404).json({ message: 'Hewan tidak ditemukan' });
        
        await hewan.update(req.body);
        res.json(hewan);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengupdate hewan qurban' });
    }
};

exports.deleteHewan = async (req, res) => {
    try {
        const { id } = req.params;
        const hewan = await QurbanHewan.findByPk(id);
        if (!hewan) return res.status(404).json({ message: 'Hewan tidak ditemukan' });
        
        await hewan.destroy();
        res.json({ message: 'Hewan berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus hewan qurban' });
    }
};

// Qurban Peserta Controllers
exports.createPeserta = async (req, res) => {
    try {
        const { nama_shohibul, alamat, jumlah_patungan, QurbanHewanId } = req.body;
        if (!nama_shohibul || !QurbanHewanId) {
            return res.status(400).json({ message: 'Data tidak lengkap' });
        }
        
        const peserta = await QurbanPeserta.create({ nama_shohibul, alamat, jumlah_patungan, QurbanHewanId });
        res.status(201).json(peserta);
    } catch (error) {
        console.error('Error creating peserta qurban:', error);
        res.status(500).json({ message: 'Gagal menambahkan peserta qurban' });
    }
};

exports.deletePeserta = async (req, res) => {
    try {
        const { id } = req.params;
        const peserta = await QurbanPeserta.findByPk(id);
        if (!peserta) return res.status(404).json({ message: 'Peserta tidak ditemukan' });
        
        await peserta.destroy();
        res.json({ message: 'Peserta berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus peserta qurban' });
    }
};
