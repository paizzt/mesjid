const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AsetTerbatas = sequelize.define('AsetTerbatas', {
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
    tujuan_dana: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Tujuan spesifik penggunaan dana (ISAK 35)', // e.g., 'Pembangunan Kubah', 'Santunan Anak Yatim'
    },
    nama_donatur: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Diisi jika pemasukan, untuk detail donatur'
    },
    kontak_donatur: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Email atau No HP donatur untuk laporan'
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
    tableName: 'aset_terbatas'
});

module.exports = AsetTerbatas;
