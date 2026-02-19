'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('pessoas', 'whatsapp', {
      type: Sequelize.STRING(20),
      allowNull: true
    });
    
    await queryInterface.addColumn('pessoas', 'biografia', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('pessoas', 'especialidade', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('pessoas', 'whatsapp');
    await queryInterface.removeColumn('pessoas', 'biografia');
    await queryInterface.removeColumn('pessoas', 'especialidade');
  }
};