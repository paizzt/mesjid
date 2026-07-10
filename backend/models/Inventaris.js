const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventaris = sequelize.define('Inventaris', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_barang: {
        type: DataTypes.STRING,
        allowNull: false
    },
    jumlah: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    kondisi: {
        type: DataTypes.ENUM('baik', 'rusak', 'hilang'),
        defaultValue: 'baik'
    },
    lokasi: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tanggal_perolehan: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    keterangan: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Inventaris;
