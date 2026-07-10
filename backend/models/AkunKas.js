const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AkunKas = sequelize.define('AkunKas', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_akun: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tipe_akun: {
        type: DataTypes.ENUM('tunai', 'bank', 'lainnya'),
        defaultValue: 'tunai'
    },
    nomor_rekening: {
        type: DataTypes.STRING,
        allowNull: true
    },
    saldo: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },
    MasjidId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'masjid',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
}, {
    timestamps: true,
    tableName: 'akun_kas'
});

module.exports = AkunKas;
