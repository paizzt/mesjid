'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('masjid', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nama_masjid: {
        type: Sequelize.STRING,
        allowNull: false
      },
      alamat: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      koordinat: {
        type: Sequelize.STRING,
        allowNull: true
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
    await queryInterface.addIndex('masjid', ['UserId']);
    await queryInterface.addIndex('masjid', ['nama_masjid']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('masjid');
  }
};
