const { Masjid } = require('../models');

// Get All Masjid
exports.getAll = async (req, res) => {
    try {
        const masjids = await Masjid.findAll();
        res.json(masjids);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create Masjid
exports.create = async (req, res) => {
    try {
        const { nama_masjid, alamat, koordinat, UserId } = req.body;
        const newMasjid = await Masjid.create({
            nama_masjid,
            alamat,
            koordinat,
            UserId // Assumes you pass the ID of the user managing this masjid
        });
        res.status(201).json(newMasjid);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get By ID
exports.getById = async (req, res) => {
    try {
        const masjid = await Masjid.findByPk(req.params.id);
        if (!masjid) return res.status(404).json({ message: 'Masjid not found' });
        res.json(masjid);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Masjid.update(req.body, { where: { id } });
        if (updated) {
            const updatedMasjid = await Masjid.findByPk(id);
            res.json(updatedMasjid);
        } else {
            res.status(404).json({ message: 'Masjid not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Masjid.destroy({ where: { id } });
        if (deleted) {
            res.json({ message: 'Masjid deleted' });
        } else {
            res.status(404).json({ message: 'Masjid not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
