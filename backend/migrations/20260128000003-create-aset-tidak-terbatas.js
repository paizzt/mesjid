'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('aset_tidak_terbatas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tanggal: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      uraian: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      jumlah: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      tipe: {
        type: Sequelize.ENUM('pemasukan', 'pengeluaran'),
        allowNull: false
      },
      kategori: {
        type: Sequelize.STRING,
        defaultValue: 'Umum'
      },
      MasjidId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'masjid',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    // Create indexes
    await queryInterface.addIndex('aset_tidak_terbatas', ['MasjidId']);
    await queryInterface.addIndex('aset_tidak_terbatas', ['tanggal']);
    await queryInterface.addIndex('aset_tidak_terbatas', ['tipe']);
    await queryInterface.addIndex('aset_tidak_terbatas', ['kategori']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('aset_tidak_terbatas');
  }
};
