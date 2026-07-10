'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('masjid', [
      {
        nama_masjid: 'Masjid Raya Al-Falah',
        alamat: 'Jakarta Selatan, DKI Jakarta',
        telepon: '081234567890',
        email: 'info@alfalah.com',
        ketua_pengurus: 'Reza Maulana',
        UserId: 1,
        announcements: 'Selamat datang di Sistem Informasi Manajemen Masjid Raya Al-Falah.\nMohon jaga kebersihan area masjid.',
        countdown_duration: 600,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {
      ignoreDuplicates: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('masjid', null, {});
  }
};
