'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('kategori', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nama_kategori: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tipe: {
        type: Sequelize.ENUM('pemasukan', 'pengeluaran'),
        allowNull: false
      },
      jenis_aset: {
        type: Sequelize.ENUM('terbatas', 'tidak_terbatas', 'semua'),
        allowNull: false,
        defaultValue: 'semua',
        comment: 'semua = dapat digunakan untuk kedua jenis aset'
      },
      deskripsi: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes
    await queryInterface.addIndex('kategori', ['tipe']);
    await queryInterface.addIndex('kategori', ['jenis_aset']);
    await queryInterface.addIndex('kategori', ['is_active']);

    // Insert default categories
    const now = new Date();
    await queryInterface.bulkInsert('kategori', [
      // Pemasukan - Tidak Terbatas
      { nama_kategori: 'Infaq Jumat', tipe: 'pemasukan', jenis_aset: 'tidak_terbatas', is_active: true, createdAt: now, updatedAt: now },
      { nama_kategori: 'Zakat Maal', tipe: 'pemasukan', jenis_aset: 'semua', is_active: true, createdAt: now, updatedAt: now },
      { nama_kategori: 'Zakat Fitrah', tipe: 'pemasukan', jenis_aset: 'semua', is_active: true, createdAt: now, updatedAt: now },
      { nama_kategori: 'Waqaf Tunai', tipe: 'pemasukan', jenis_aset: 'terbatas', is_active: true, createdAt: now, updatedAt: now },
      { nama_kategori: 'Donasi Pembangunan', tipe: 'pemasukan', jenis_aset: 'terbatas', is_active: true, createdAt: now, updatedAt: now },
      { nama_kategori: 'Donasi Anak Yatim', tipe: 'pemasukan', jenis_aset: 'terbatas', is_active: true, createdAt: now, updatedAt: now },
      { nama_kategori: 'Sponsorship', tipe: 'pemasukan', jenis_aset: 'semua', is_active: true, createdAt: now, updatedAt: now },
      
      // Pengeluaran - Tidak Terbatas
      { nama_kategori: 'Operasional Masjid', tipe: 'pengeluaran', jenis_aset: 'tidak_terbatas', is_active: true, createdAt: now, updatedAt: now },
      { nama_kategori: 'Honor Imam/Marbot', tipe: 'pengeluaran', jenis_aset: 'tidak_terbatas', is_active: true, createdAt: now, updatedAt: now },
      { nama_kategori: 'Pembangunan & Renovasi', tipe: 'pengeluaran', jenis_aset: 'semua', is_active: true, createdAt: now, updatedAt: now },
      { nama_kategori: 'Penyaluran Zakat', tipe: 'pengeluaran', jenis_aset: 'terbatas', is_active: true, createdAt: now, updatedAt: now },
      { nama_kategori: 'Santunan Yatim/Dhuafa', tipe: 'pengeluaran', jenis_aset: 'semua', is_active: true, createdAt: now, updatedAt: now },
      { nama_kategori: 'Kegiatan Dakwah', tipe: 'pengeluaran', jenis_aset: 'tidak_terbatas', is_active: true, createdAt: now, updatedAt: now },
      { nama_kategori: 'Perlengkapan Kebersihan', tipe: 'pengeluaran', jenis_aset: 'tidak_terbatas', is_active: true, createdAt: now, updatedAt: now },
      { nama_kategori: 'Pemeliharaan Aset', tipe: 'pengeluaran', jenis_aset: 'tidak_terbatas', is_active: true, createdAt: now, updatedAt: now },
      { nama_kategori: 'Lainnya', tipe: 'pemasukan', jenis_aset: 'semua', is_active: true, createdAt: now, updatedAt: now },
      { nama_kategori: 'Lainnya', tipe: 'pengeluaran', jenis_aset: 'semua', is_active: true, createdAt: now, updatedAt: now }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('kategori');
  }
};
