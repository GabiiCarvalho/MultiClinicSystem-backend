'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('procedimentos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

      nome: { type: Sequelize.STRING(100), allowNull: false },
      descricao: { type: Sequelize.TEXT },
      preco: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      duracao_minutos: { type: Sequelize.INTEGER, defaultValue: 30 },
      ativo: { type: Sequelize.BOOLEAN, defaultValue: true },

      categoria_id: {
        type: Sequelize.INTEGER,
        references: { model: 'categorias', key: 'id' },
        onDelete: 'SET NULL'
      },

      clinica_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'clinicas', key: 'id' },
        onDelete: 'CASCADE'
      },

      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('procedimentos', ['clinica_id']);
    await queryInterface.addIndex('procedimentos', ['categoria_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('procedimentos');
  }
};