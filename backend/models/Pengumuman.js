const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pengumuman = sequelize.define('Pengumuman', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    judul: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isi: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    tanggal_berakhir: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

module.exports = Pengumuman;
