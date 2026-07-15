'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword1 = await bcrypt.hash('12345678', 10);
    const hashedPassword2 = await bcrypt.hash('12345678', 10);

    await queryInterface.bulkInsert('Users', [
      {
        username: 'takmir',
        email: 'takmir@gmail.com',
        password: hashedPassword1,
        nama_lengkap: 'Reza Maulana (Takmir)',
        no_hp: '12345678',
        role: 'takmir',
        status_verifikasi: 'approved',
        catatan_admin: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'bendahara',
        email: 'bendahara@gmail.com',
        password: hashedPassword2,
        nama_lengkap: 'Bendahara Masjid',
        no_hp: '12345678',
        role: 'bendahara',
        status_verifikasi: 'approved',
        catatan_admin: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'jamaah',
        email: 'jamaah@gmail.com',
        password: hashedPassword2,
        nama_lengkap: 'Jamaah Umum',
        no_hp: '12345678',
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
