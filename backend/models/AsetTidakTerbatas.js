const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AsetTidakTerbatas = sequelize.define('AsetTidakTerbatas', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tanggal: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    uraian: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    jumlah: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    tipe: {
        type: DataTypes.ENUM('pemasukan', 'pengeluaran'),
        allowNull: false
    },
    kategori: {
        type: DataTypes.STRING, // Legacy field, kept for backward compatibility
        allowNull: true
    },
    KategoriId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'kategori',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    AkunKasId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'akun_kas',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    tableName: 'aset_tidak_terbatas'
});

module.exports = AsetTidakTerbatas;
