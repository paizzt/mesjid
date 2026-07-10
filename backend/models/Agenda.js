const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Agenda = sequelize.define('Agenda', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    judul: {
        type: DataTypes.STRING,
        allowNull: false
    },
    deskripsi: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    tanggal: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    waktu_mulai: {
        type: DataTypes.TIME,
        allowNull: false
    },
    waktu_selesai: {
        type: DataTypes.TIME,
        allowNull: true
    },
    lokasi: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Masjid'
    },
    pembicara: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('mendatang', 'selesai', 'batal'),
        defaultValue: 'mendatang'
    }
}, {
    timestamps: true
});

module.exports = Agenda;
