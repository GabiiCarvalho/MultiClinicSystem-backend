'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remover tabelas relacionadas a pets
    await queryInterface.dropTable('planos_mensais');
    await queryInterface.dropTable('pets');
    
    // Renomear clientes para pacientes (se existir)
    const tables = await queryInterface.showAllTables();
    if (tables.includes('clientes')) {
      await queryInterface.renameTable('clientes', 'pacientes');
    }
    
    // Renomear servicos para procedimentos (se existir)
    if (tables.includes('servicos')) {
      await queryInterface.renameTable('servicos', 'procedimentos');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Não é possível reverter facilmente, mas deixamos vazio
    console.log('Não é possível reverter a remoção das tabelas de pets');
  }
};