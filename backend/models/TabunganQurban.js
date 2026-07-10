const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TabunganQurban = sequelize.define('TabunganQurban', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_peserta: {
        type: DataTypes.STRING,
        allowNull: false
    },
    target_hewan: {
        type: DataTypes.STRING,
        allowNull: true
    },
    target_nominal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    total_terkumpul: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('aktif', 'selesai', 'batal'),
        defaultValue: 'aktif'
    }
}, {
    timestamps: true
});

module.exports = TabunganQurban;
