'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('aset_terbatas', {
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
      tujuan_dana: {
        type: Sequelize.STRING,
        allowNull: false
      },
      nama_donatur: {
        type: Sequelize.STRING,
        allowNull: true
      },
      kontak_donatur: {
        type: Sequelize.STRING,
        allowNull: true
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
    await queryInterface.addIndex('aset_terbatas', ['MasjidId']);
    await queryInterface.addIndex('aset_terbatas', ['tanggal']);
    await queryInterface.addIndex('aset_terbatas', ['tipe']);
    await queryInterface.addIndex('aset_terbatas', ['tujuan_dana']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('aset_terbatas');
  }
};
