const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QurbanHewan = sequelize.define('QurbanHewan', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tahun_hijriah: {
        type: DataTypes.STRING,
        allowNull: false
    },
    jenis_hewan: {
        type: DataTypes.ENUM('sapi', 'kambing', 'domba'),
        allowNull: false
    },
    tipe: {
        type: DataTypes.ENUM('patungan', 'sendiri'),
        allowNull: false,
        defaultValue: 'patungan'
    },
    harga: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('rencana', 'terbeli', 'disembelih'),
        defaultValue: 'rencana'
    }
}, {
    timestamps: true
});

module.exports = QurbanHewan;
