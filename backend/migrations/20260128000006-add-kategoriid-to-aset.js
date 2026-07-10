'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add KategoriId to aset_tidak_terbatas
    await queryInterface.addColumn('aset_tidak_terbatas', 'KategoriId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'kategori',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addIndex('aset_tidak_terbatas', ['KategoriId']);

    // Add KategoriId to aset_terbatas
    await queryInterface.addColumn('aset_terbatas', 'KategoriId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'kategori',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addIndex('aset_terbatas', ['KategoriId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('aset_tidak_terbatas', 'KategoriId');
    await queryInterface.removeColumn('aset_terbatas', 'KategoriId');
  }
};
