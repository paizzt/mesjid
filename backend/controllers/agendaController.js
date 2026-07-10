const { Agenda } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const { masjid_id } = req.query;
        let whereClause = {};
        if (masjid_id) whereClause.MasjidId = masjid_id;

        const data = await Agenda.findAll({
            where: whereClause,
            order: [['tanggal', 'ASC'], ['waktu_mulai', 'ASC']]
        });
        res.json(data);
    } catch (error) {
        console.error('Error getting agenda:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

exports.create = async (req, res) => {
    try {
        const { judul, deskripsi, tanggal, waktu_mulai, waktu_selesai, lokasi, pembicara, status, MasjidId } = req.body;
        if (!judul || !tanggal || !waktu_mulai || !MasjidId) {
            return res.status(400).json({ message: 'Data tidak lengkap' });
        }
        const data = await Agenda.create(req.body);
        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating agenda:', error);
        res.status(500).json({ message: 'Gagal menambahkan agenda' });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Agenda.findByPk(id);
        if (!data) return res.status(404).json({ message: 'Agenda tidak ditemukan' });
        
        await data.update(req.body);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengupdate agenda' });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Agenda.findByPk(id);
        if (!data) return res.status(404).json({ message: 'Agenda tidak ditemukan' });
        
        await data.destroy();
        res.json({ message: 'Agenda berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus agenda' });
    }
};
