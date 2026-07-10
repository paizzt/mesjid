const { Inventaris } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const { masjid_id } = req.query;
        let whereClause = {};
        if (masjid_id) whereClause.MasjidId = masjid_id;

        const data = await Inventaris.findAll({
            where: whereClause,
            order: [['nama_barang', 'ASC']]
        });
        res.json(data);
    } catch (error) {
        console.error('Error getting inventaris:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

exports.create = async (req, res) => {
    try {
        const { nama_barang, jumlah, kondisi, lokasi, tanggal_perolehan, keterangan, MasjidId } = req.body;
        if (!nama_barang || !jumlah || !MasjidId) {
            return res.status(400).json({ message: 'Data tidak lengkap' });
        }
        const data = await Inventaris.create(req.body);
        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating inventaris:', error);
        res.status(500).json({ message: 'Gagal menambahkan inventaris' });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Inventaris.findByPk(id);
        if (!data) return res.status(404).json({ message: 'Inventaris tidak ditemukan' });
        
        await data.update(req.body);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengupdate inventaris' });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Inventaris.findByPk(id);
        if (!data) return res.status(404).json({ message: 'Inventaris tidak ditemukan' });
        
        await data.destroy();
        res.json({ message: 'Inventaris berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus inventaris' });
    }
};
