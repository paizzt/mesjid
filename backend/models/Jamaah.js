const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Jamaah = sequelize.define('Jamaah', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nik: {
        type: DataTypes.STRING,
        allowNull: true
    },
    nama_lengkap: {
        type: DataTypes.STRING,
        allowNull: false
    },
    jenis_kelamin: {
        type: DataTypes.ENUM('L', 'P'),
        allowNull: false,
        defaultValue: 'L'
    },
    no_hp: {
        type: DataTypes.STRING,
        allowNull: true
    },
    alamat: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status_pernikahan: {
        type: DataTypes.ENUM('Belum Menikah', 'Menikah', 'Cerai Hidup', 'Cerai Mati'),
        allowNull: true,
        defaultValue: 'Belum Menikah'
    },
    pekerjaan: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Jamaah;
