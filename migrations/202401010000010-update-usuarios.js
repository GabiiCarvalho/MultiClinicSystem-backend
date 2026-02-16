'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adicionar campos para dentistas
    await queryInterface.addColumn('usuarios', 'especialidade', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('usuarios', 'cro', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    });

    // Alterar ENUM para incluir novos cargos
    await queryInterface.sequelize.query(`
      ALTER TABLE usuarios 
      MODIFY COLUMN cargo ENUM('gestor', 'dentista', 'atendente', 'financeiro') 
      NOT NULL DEFAULT 'atendente'
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('usuarios', 'especialidade');
    await queryInterface.removeColumn('usuarios', 'cro');
    
    // Reverter ENUM para os valores originais
    await queryInterface.sequelize.query(`
      ALTER TABLE usuarios 
      MODIFY COLUMN cargo ENUM('gestor', 'funcionario') 
      NOT NULL DEFAULT 'funcionario'
    `);
  }
};