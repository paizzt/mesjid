module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('masjid', 'telepon', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('masjid', 'email', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('masjid', 'ketua_pengurus', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('masjid', 'countdown_duration', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 600
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('masjid', 'telepon');
    await queryInterface.removeColumn('masjid', 'email');
    await queryInterface.removeColumn('masjid', 'ketua_pengurus');
    await queryInterface.removeColumn('masjid', 'countdown_duration');
  }
};
