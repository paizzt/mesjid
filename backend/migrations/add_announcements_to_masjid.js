module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('masjid', 'announcements', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Pengumuman yang ditampilkan di marquee, pisahkan baris dengan newline'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('masjid', 'announcements');
  }
};
