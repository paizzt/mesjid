const { AsetTerbatas, AkunKas, sequelize } = require('../models');

// Get All
exports.getAll = async (req, res) => {
    try {
        const { masjid_id } = req.query;
        const whereClause = {};
        if (masjid_id) whereClause.MasjidId = masjid_id;

        const data = await AsetTerbatas.findAll({
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
        const { tanggal, uraian, jumlah, tipe, tujuan_dana, nama_donatur, kontak_donatur, MasjidId, AkunKasId } = req.body;
        
        if (!MasjidId) {
            return res.status(400).json({ message: 'MasjidId is required' });
        }
        
        // Basic validation
        if (tipe === 'pemasukan' && !nama_donatur) {
             // Optional: Force donor name for restricted income as per requirement "dibutuhkan detail donatur"
             // But maybe allow "Hamba Allah"
        }

        const newData = await AsetTerbatas.create({
            tanggal, uraian, jumlah, tipe, tujuan_dana, nama_donatur, kontak_donatur, MasjidId, AkunKasId
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
        const data = await AsetTerbatas.findByPk(req.params.id);
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
        const [updated] = await AsetTerbatas.update(req.body, { where: { id } });
        if (updated) {
            const updatedData = await AsetTerbatas.findByPk(id);
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
        const deleted = await AsetTerbatas.destroy({ where: { id } });
        if (deleted) {
            res.json({ message: 'Data deleted' });
        } else {
            res.status(404).json({ message: 'Data not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Laporan Per Tujuan Dana (Monitoring Anggaran)
exports.getLaporanPerTujuan = async (req, res) => {
    try {
        const { masjid_id } = req.query;
        const whereClause = {};
        if (masjid_id) whereClause.MasjidId = masjid_id;

        // Group by tujuan_dana
        const data = await AsetTerbatas.findAll({
            where: whereClause,
            attributes: [
                'tujuan_dana',
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN tipe = 'pemasukan' THEN jumlah ELSE 0 END")), 'total_pemasukan'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN tipe = 'pengeluaran' THEN jumlah ELSE 0 END")), 'total_pengeluaran']
            ],
            group: ['tujuan_dana']
        });

        // Format result to include saldo
        const laporan = data.map(item => {
            const masuk = Number(item.dataValues.total_pemasukan);
            const keluar = Number(item.dataValues.total_pengeluaran);
            return {
                tujuan_dana: item.tujuan_dana,
                total_pemasukan: masuk,
                total_pengeluaran: keluar,
                saldo_tersisa: masuk - keluar
            };
        });

        res.json(laporan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Available Sumber Dana (Fund sources with positive balance)
exports.getSumberDana = async (req, res) => {
    try {
        const { masjid_id } = req.query;
        const whereClause = {};
        if (masjid_id) whereClause.MasjidId = masjid_id;

        // Group by tujuan_dana
        const data = await AsetTerbatas.findAll({
            where: whereClause,
            attributes: [
                'tujuan_dana',
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN tipe = 'pemasukan' THEN jumlah ELSE 0 END")), 'total_pemasukan'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN tipe = 'pengeluaran' THEN jumlah ELSE 0 END")), 'total_pengeluaran']
            ],
            group: ['tujuan_dana']
        });

        // Filter only sources with positive balance
        const sumberDana = data
            .map(item => {
                const masuk = Number(item.dataValues.total_pemasukan);
                const keluar = Number(item.dataValues.total_pengeluaran);
                const saldo = masuk - keluar;
                return {
                    tujuan_dana: item.tujuan_dana,
                    saldo_tersedia: saldo
                };
            })
            .filter(item => item.saldo_tersedia > 0);

        res.json(sumberDana);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
