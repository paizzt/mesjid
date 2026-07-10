const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware untuk verifikasi JWT token
exports.authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({ message: 'Token tidak ditemukan. Silakan login.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'User tidak ditemukan.' });
        }

        if (user.status_verifikasi !== 'approved') {
            return res.status(403).json({ message: 'Akun Anda belum diverifikasi oleh admin.' });
        }

        req.user = user; // Attach user to request
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token tidak valid atau kadaluarsa.' });
    }
};

// Middleware untuk memverifikasi role admin
exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang diizinkan.' });
    }
    next();
};

// Middleware untuk memverifikasi role takmir atau admin
exports.isTakmirOrAdmin = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'takmir') {
        return res.status(403).json({ message: 'Akses ditolak.' });
    }
    next();
};

// Middleware untuk memverifikasi array of roles
exports.authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }
    return (req, res, next) => {
        if (!req.user || (roles.length && !roles.includes(req.user.role))) {
            return res.status(403).json({ message: 'Akses ditolak. Peran Anda tidak memiliki izin untuk fitur ini.' });
        }
        next();
    };
};
