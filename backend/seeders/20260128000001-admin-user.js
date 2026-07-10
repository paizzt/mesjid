'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword1 = await bcrypt.hash('0895333660777', 10);
    const hashedPassword2 = await bcrypt.hash('password123', 10);
    
    await queryInterface.bulkInsert('Users', [
      {
        username: 'rezamaulana',
        email: 'saya@rezamaulana.com',
        password: hashedPassword1,
        nama_lengkap: 'Reza Maulana (Takmir)',
        no_hp: '0895333660777',
        role: 'takmir',
        status_verifikasi: 'approved',
        catatan_admin: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'bendahara',
        email: 'bendahara@masjid.com',
        password: hashedPassword2,
        nama_lengkap: 'Bendahara Masjid',
        no_hp: '081200000002',
        role: 'bendahara',
        status_verifikasi: 'approved',
        catatan_admin: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'jamaah',
        email: 'jamaah@masjid.com',
        password: hashedPassword2,
        nama_lengkap: 'Jamaah Umum',
        no_hp: '081200000003',
        role: 'jamaah',
        status_verifikasi: 'approved',
        catatan_admin: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {
      ignoreDuplicates: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
