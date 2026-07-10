const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QurbanPeserta = sequelize.define('QurbanPeserta', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_shohibul: {
        type: DataTypes.STRING,
        allowNull: false
    },
    alamat: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    jumlah_patungan: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    }
}, {
    timestamps: true
});

module.exports = QurbanPeserta;
