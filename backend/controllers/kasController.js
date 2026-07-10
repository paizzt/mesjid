const { AkunKas, Masjid } = require('../models');

exports.getAllKas = async (req, res) => {
    try {
        const { masjidId } = req.params;
        const akunKas = await AkunKas.findAll({ where: { MasjidId: masjidId } });
        res.json(akunKas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createKas = async (req, res) => {
    try {
        const { masjidId } = req.params;
        const { nama_akun, tipe_akun, nomor_rekening, saldo_awal } = req.body;

        const newKas = await AkunKas.create({
            nama_akun,
            tipe_akun: tipe_akun || 'tunai',
            nomor_rekening: nomor_rekening || null,
            saldo: saldo_awal || 0,
            MasjidId: masjidId
        });

        res.status(201).json({ message: 'Akun kas berhasil ditambahkan', data: newKas });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateKas = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_akun, tipe_akun, nomor_rekening } = req.body;

        const kas = await AkunKas.findByPk(id);
        if (!kas) return res.status(404).json({ message: 'Akun kas tidak ditemukan' });

        kas.nama_akun = nama_akun || kas.nama_akun;
        kas.tipe_akun = tipe_akun || kas.tipe_akun;
        kas.nomor_rekening = nomor_rekening !== undefined ? nomor_rekening : kas.nomor_rekening;

        await kas.save();
        res.json({ message: 'Akun kas berhasil diperbarui', data: kas });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteKas = async (req, res) => {
    try {
        const { id } = req.params;
        const kas = await AkunKas.findByPk(id);
        
        if (!kas) return res.status(404).json({ message: 'Akun kas tidak ditemukan' });
        
        // Jangan hapus jika saldo tidak 0 (best practice akuntansi)
        if (parseFloat(kas.saldo) !== 0) {
            return res.status(400).json({ message: 'Tidak dapat menghapus akun kas yang masih memiliki saldo. Pindahkan saldo terlebih dahulu.' });
        }

        await kas.destroy();
        res.json({ message: 'Akun kas berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.transferKas = async (req, res) => {
    try {
        const { dari_kas_id, ke_kas_id, jumlah, keterangan } = req.body;

        if (dari_kas_id === ke_kas_id) {
            return res.status(400).json({ message: 'Akun asal dan tujuan tidak boleh sama' });
        }

        const dariKas = await AkunKas.findByPk(dari_kas_id);
        const keKas = await AkunKas.findByPk(ke_kas_id);

        if (!dariKas || !keKas) {
            return res.status(404).json({ message: 'Akun kas tidak ditemukan' });
        }

        if (parseFloat(dariKas.saldo) < parseFloat(jumlah)) {
            return res.status(400).json({ message: 'Saldo akun asal tidak mencukupi' });
        }

        // Lakukan transfer
        dariKas.saldo = parseFloat(dariKas.saldo) - parseFloat(jumlah);
        keKas.saldo = parseFloat(keKas.saldo) + parseFloat(jumlah);

        await dariKas.save();
        await keKas.save();

        res.json({ message: 'Transfer berhasil', data: { dariKas, keKas } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
