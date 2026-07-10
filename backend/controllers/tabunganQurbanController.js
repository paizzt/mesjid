const { TabunganQurban, TabunganQurbanSetoran } = require('../models');

exports.getAllTabungan = async (req, res) => {
    try {
        const { masjid_id } = req.query;
        let whereClause = {};
        if (masjid_id) whereClause.MasjidId = masjid_id;

        const tabunganList = await TabunganQurban.findAll({
            where: whereClause,
            include: [{ model: TabunganQurbanSetoran, as: 'setoran' }],
            order: [['createdAt', 'DESC']]
        });
        
        res.json(tabunganList);
    } catch (error) {
        console.error('Error getting tabungan:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

exports.createTabungan = async (req, res) => {
    try {
        const { nama_peserta, target_hewan, target_nominal, MasjidId } = req.body;
        if (!nama_peserta || !MasjidId) {
            return res.status(400).json({ message: 'Data tidak lengkap' });
        }
        
        const tabungan = await TabunganQurban.create({ nama_peserta, target_hewan, target_nominal, MasjidId });
        res.status(201).json(tabungan);
    } catch (error) {
        console.error('Error creating tabungan:', error);
        res.status(500).json({ message: 'Gagal menambahkan tabungan' });
    }
};

exports.updateTabungan = async (req, res) => {
    try {
        const { id } = req.params;
        const tabungan = await TabunganQurban.findByPk(id);
        if (!tabungan) return res.status(404).json({ message: 'Tabungan tidak ditemukan' });
        
        await tabungan.update(req.body);
        res.json(tabungan);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengupdate tabungan' });
    }
};

exports.deleteTabungan = async (req, res) => {
    try {
        const { id } = req.params;
        const tabungan = await TabunganQurban.findByPk(id);
        if (!tabungan) return res.status(404).json({ message: 'Tabungan tidak ditemukan' });
        
        await tabungan.destroy();
        res.json({ message: 'Tabungan berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus tabungan' });
    }
};

// Setoran Controllers
exports.createSetoran = async (req, res) => {
    try {
        const { TabunganQurbanId, tanggal, nominal, keterangan } = req.body;
        if (!TabunganQurbanId || !tanggal || !nominal) {
            return res.status(400).json({ message: 'Data tidak lengkap' });
        }
        
        const setoran = await TabunganQurbanSetoran.create({ TabunganQurbanId, tanggal, nominal, keterangan });
        
        // Update total terkumpul in Tabungan
        const tabungan = await TabunganQurban.findByPk(TabunganQurbanId);
        const newTotal = parseFloat(tabungan.total_terkumpul) + parseFloat(nominal);
        await tabungan.update({ total_terkumpul: newTotal });

        res.status(201).json(setoran);
    } catch (error) {
        console.error('Error creating setoran:', error);
        res.status(500).json({ message: 'Gagal menambahkan setoran' });
    }
};
