const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Masjid } = require('../models');

// Register - User mendaftar dengan data diri dan data masjid
exports.register = async (req, res) => {
    try {
        const { username, email, password, nama_lengkap, no_hp, masjid } = req.body;

        // Validasi input
        if (!username || !email || !password || !nama_lengkap) {
            return res.status(400).json({ 
                message: 'Data tidak lengkap. Harap isi username, email, password, dan nama lengkap.' 
            });
        }

        // Cek apakah username atau email sudah terdaftar
        const existingUser = await User.findOne({ 
            where: { 
                [require('sequelize').Op.or]: [{ username }, { email }] 
            } 
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Username atau email sudah terdaftar.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Buat user baru (default role jamaah)
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            nama_lengkap,
            no_hp,
            role: req.body.role || 'jamaah', // bisa dikirim role saat register (untuk takmir awal)
            status_verifikasi: 'approved' // auto approve untuk jamaah
        });

        // Cari atau buat Masjid Agung Sultan Alauddin
        let defaultMasjid = await Masjid.findOne({ where: { nama_masjid: 'Masjid Agung Sultan Alauddin' } });
        if (!defaultMasjid) {
            defaultMasjid = await Masjid.create({
                nama_masjid: 'Masjid Agung Sultan Alauddin',
                alamat: 'Jl. Alauddin, Makassar',
                koordinat: null,
                UserId: newUser.id
            });
        }

        res.status(201).json({
            message: 'Registrasi berhasil!',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                nama_lengkap: newUser.nama_lengkap,
                role: newUser.role,
                status_verifikasi: newUser.status_verifikasi
            },
            masjid: {
                id: defaultMasjid.id,
                nama_masjid: defaultMasjid.nama_masjid,
                alamat: defaultMasjid.alamat
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username dan password harus diisi.' });
        }

        // Cari user berdasarkan username atau email
        const user = await User.findOne({
            where: {
                [require('sequelize').Op.or]: [{ username }, { email: username }]
            }
        });

        if (!user) {
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        // Cek status verifikasi
        if (user.status_verifikasi === 'pending') {
            return res.status(403).json({ 
                message: 'Akun Anda masih menunggu verifikasi dari admin.' 
            });
        }

        if (user.status_verifikasi === 'rejected') {
            return res.status(403).json({ 
                message: `Akun Anda ditolak. ${user.catatan_admin ? 'Alasan: ' + user.catatan_admin : ''}` 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login berhasil!',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                nama_lengkap: user.nama_lengkap,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Profile (untuk user yang sudah login)
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
            include: [{
                model: Masjid,
                as: 'Masjids'
            }]
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get semua user yang pending verifikasi
exports.getPendingUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            where: { status_verifikasi: 'pending' },
            attributes: { exclude: ['password'] },
            include: [{
                model: Masjid,
                as: 'Masjids'
            }]
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Verifikasi user
exports.verifyUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, catatan_admin } = req.body; // status: 'approved' atau 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status harus approved atau rejected.' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan.' });
        }

        user.status_verifikasi = status;
        user.catatan_admin = catatan_admin || null;
        await user.save();

        res.json({
            message: `User berhasil di${status === 'approved' ? 'setujui' : 'tolak'}.`,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                status_verifikasi: user.status_verifikasi,
                catatan_admin: user.catatan_admin
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get semua user
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            include: [{
                model: Masjid,
                as: 'Masjids'
            }]
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
