const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Kategori = sequelize.define('Kategori', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nama_kategori: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipe: {
    type: DataTypes.ENUM('pemasukan', 'pengeluaran'),
    allowNull: false
  },
  jenis_aset: {
    type: DataTypes.ENUM('terbatas', 'tidak_terbatas', 'semua'),
    allowNull: false,
    defaultValue: 'semua',
    comment: 'semua = dapat digunakan untuk kedua jenis aset'
  },
  deskripsi: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'kategori',
  timestamps: true
});

module.exports = Kategori;
