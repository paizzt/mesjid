const Kategori = require('../models/Kategori');

// Get all kategori with optional filters
exports.getAll = async (req, res) => {
    try {
        const { tipe, jenis_aset, is_active } = req.query;
        const where = {};

        if (tipe) where.tipe = tipe;
        if (jenis_aset) {
            // If filtering by jenis_aset, include both specific and 'semua'
            where.jenis_aset = [jenis_aset, 'semua'];
        }
        if (is_active !== undefined) where.is_active = is_active === 'true';

        const kategori = await Kategori.findAll({ 
            where,
            order: [['nama_kategori', 'ASC']]
        });

        res.json(kategori);
    } catch (error) {
        console.error('Error fetching kategori:', error);
        res.status(500).json({ message: 'Error fetching kategori' });
    }
};

// Get kategori by ID
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const kategori = await Kategori.findByPk(id);

        if (!kategori) {
            return res.status(404).json({ message: 'Kategori not found' });
        }

        res.json(kategori);
    } catch (error) {
        console.error('Error fetching kategori:', error);
        res.status(500).json({ message: 'Error fetching kategori' });
    }
};

// Create new kategori
exports.create = async (req, res) => {
    try {
        const { nama_kategori, tipe, jenis_aset, deskripsi, is_active } = req.body;

        // Validation
        if (!nama_kategori || !tipe) {
            return res.status(400).json({ message: 'Nama kategori and tipe are required' });
        }

        if (!['pemasukan', 'pengeluaran'].includes(tipe)) {
            return res.status(400).json({ message: 'Invalid tipe. Must be pemasukan or pengeluaran' });
        }

        if (jenis_aset && !['terbatas', 'tidak_terbatas', 'semua'].includes(jenis_aset)) {
            return res.status(400).json({ message: 'Invalid jenis_aset' });
        }

        // Check for duplicate
        const existing = await Kategori.findOne({
            where: {
                nama_kategori,
                tipe,
                jenis_aset: jenis_aset || 'semua'
            }
        });

        if (existing) {
            return res.status(400).json({ message: 'Kategori already exists' });
        }

        const kategori = await Kategori.create({
            nama_kategori,
            tipe,
            jenis_aset: jenis_aset || 'semua',
            deskripsi,
            is_active: is_active !== undefined ? is_active : true
        });

        res.status(201).json({
            message: 'Kategori created successfully',
            data: kategori
        });
    } catch (error) {
        console.error('Error creating kategori:', error);
        res.status(500).json({ message: 'Error creating kategori' });
    }
};

// Update kategori
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_kategori, tipe, jenis_aset, deskripsi, is_active } = req.body;

        const kategori = await Kategori.findByPk(id);

        if (!kategori) {
            return res.status(404).json({ message: 'Kategori not found' });
        }

        await kategori.update({
            nama_kategori: nama_kategori || kategori.nama_kategori,
            tipe: tipe || kategori.tipe,
            jenis_aset: jenis_aset || kategori.jenis_aset,
            deskripsi: deskripsi !== undefined ? deskripsi : kategori.deskripsi,
            is_active: is_active !== undefined ? is_active : kategori.is_active
        });

        res.json({
            message: 'Kategori updated successfully',
            data: kategori
        });
    } catch (error) {
        console.error('Error updating kategori:', error);
        res.status(500).json({ message: 'Error updating kategori' });
    }
};

// Delete kategori (soft delete by setting is_active to false)
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const kategori = await Kategori.findByPk(id);

        if (!kategori) {
            return res.status(404).json({ message: 'Kategori not found' });
        }

        // Soft delete
        await kategori.update({ is_active: false });

        res.json({ message: 'Kategori deleted successfully' });
    } catch (error) {
        console.error('Error deleting kategori:', error);
        res.status(500).json({ message: 'Error deleting kategori' });
    }
};

// Hard delete kategori (permanent delete)
exports.hardDelete = async (req, res) => {
    try {
        const { id } = req.params;

        const kategori = await Kategori.findByPk(id);

        if (!kategori) {
            return res.status(404).json({ message: 'Kategori not found' });
        }

        await kategori.destroy();

        res.json({ message: 'Kategori permanently deleted' });
    } catch (error) {
        console.error('Error deleting kategori:', error);
        res.status(500).json({ message: 'Error deleting kategori' });
    }
};
