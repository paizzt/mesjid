const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Masjid = sequelize.define('Masjid', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_masjid: {
        type: DataTypes.STRING,
        allowNull: false
    },
    alamat: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    telepon: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    koordinat: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Format: Latitude, Longitude'
    },
    ketua_pengurus: {
        type: DataTypes.STRING,
        allowNull: true
    },
    countdown_duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 600,
        comment: 'Durasi countdown iqomah dalam detik'
    },
    announcements: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Pengumuman yang ditampilkan di marquee, pisahkan baris dengan newline'
    },
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    }
}, {
    timestamps: true,
    tableName: 'masjid'
});

module.exports = Masjid;
