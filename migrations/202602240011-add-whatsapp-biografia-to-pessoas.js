'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('pessoas', 'whatsapp', {
      type: Sequelize.STRING(20),
      allowNull: true
    });

    await queryInterface.addColumn('pessoas', 'biografia', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('pessoas', 'whatsapp');
    await queryInterface.removeColumn('pessoas', 'biografia');
  }
};