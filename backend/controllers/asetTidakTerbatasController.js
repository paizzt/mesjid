const { AsetTidakTerbatas, AkunKas, sequelize } = require('../models');

// Get All (Filtered by MasjidId)
exports.getAll = async (req, res) => {
    try {
        const { masjid_id } = req.query;
        const whereClause = {};
        if (masjid_id) whereClause.MasjidId = masjid_id;

        const data = await AsetTidakTerbatas.findAll({
            where: whereClause,
            order: [['tanggal', 'DESC']]
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create
exports.create = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { tanggal, uraian, jumlah, tipe, kategori, MasjidId, AkunKasId } = req.body;
        
        if (!MasjidId) {
            return res.status(400).json({ message: 'MasjidId is required' });
        }

        const newData = await AsetTidakTerbatas.create({
            tanggal, uraian, jumlah, tipe, kategori, MasjidId, AkunKasId
        }, { transaction: t });

        if (AkunKasId) {
            const kas = await AkunKas.findByPk(AkunKasId, { transaction: t });
            if (kas) {
                if (tipe === 'pemasukan') {
                    kas.saldo = parseFloat(kas.saldo) + parseFloat(jumlah);
                } else if (tipe === 'pengeluaran') {
                    kas.saldo = parseFloat(kas.saldo) - parseFloat(jumlah);
                }
                await kas.save({ transaction: t });
            }
        }

        await t.commit();
        res.status(201).json(newData);
    } catch (error) {
        await t.rollback();
        res.status(400).json({ message: error.message });
    }
};

// Get By ID
exports.getById = async (req, res) => {
    try {
        const data = await AsetTidakTerbatas.findByPk(req.params.id);
        if (!data) return res.status(404).json({ message: 'Data not found' });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await AsetTidakTerbatas.update(req.body, { where: { id } });
        if (updated) {
            const updatedData = await AsetTidakTerbatas.findByPk(id);
            res.json(updatedData);
        } else {
            res.status(404).json({ message: 'Data not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await AsetTidakTerbatas.destroy({ where: { id } });
        if (deleted) {
            res.json({ message: 'Data deleted' });
        } else {
            res.status(404).json({ message: 'Data not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Saldo Summary
exports.getSaldo = async (req, res) => {
    try {
        const { masjid_id } = req.query;
        const whereClause = {};
        if (masjid_id) whereClause.MasjidId = masjid_id;

        const pemasukan = await AsetTidakTerbatas.sum('jumlah', { where: { ...whereClause, tipe: 'pemasukan' } }) || 0;
        const pengeluaran = await AsetTidakTerbatas.sum('jumlah', { where: { ...whereClause, tipe: 'pengeluaran' } }) || 0;
        res.json({
            pemasukan,
            pengeluaran,
            saldo_akhir: pemasukan - pengeluaran
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
