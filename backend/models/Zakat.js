const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Zakat = sequelize.define('Zakat', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tahun_hijriah: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nama_muzakki: {
        type: DataTypes.STRING,
        allowNull: false
    },
    jenis_zakat: {
        type: DataTypes.ENUM('fitrah', 'mal'),
        allowNull: false,
        defaultValue: 'fitrah'
    },
    bentuk_bayar: {
        type: DataTypes.ENUM('uang', 'beras'),
        allowNull: false,
        defaultValue: 'uang'
    },
    jumlah_jiwa: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
        comment: 'Hanya untuk zakat fitrah'
    },
    nominal_uang: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0
    },
    liter_beras: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
    }
}, {
    timestamps: true
});

module.exports = Zakat;
