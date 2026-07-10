const { Pengumuman } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const { masjid_id } = req.query;
        let whereClause = {};
        if (masjid_id) whereClause.MasjidId = masjid_id;

        const data = await Pengumuman.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });
        res.json(data);
    } catch (error) {
        console.error('Error getting pengumuman:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

exports.create = async (req, res) => {
    try {
        const { judul, isi, tanggal_berakhir, is_active, MasjidId } = req.body;
        if (!judul || !isi || !MasjidId) {
            return res.status(400).json({ message: 'Data tidak lengkap' });
        }
        const data = await Pengumuman.create(req.body);
        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating pengumuman:', error);
        res.status(500).json({ message: 'Gagal menambahkan pengumuman' });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Pengumuman.findByPk(id);
        if (!data) return res.status(404).json({ message: 'Pengumuman tidak ditemukan' });
        
        await data.update(req.body);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengupdate pengumuman' });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Pengumuman.findByPk(id);
        if (!data) return res.status(404).json({ message: 'Pengumuman tidak ditemukan' });
        
        await data.destroy();
        res.json({ message: 'Pengumuman berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus pengumuman' });
    }
};
