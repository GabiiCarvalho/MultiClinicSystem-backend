'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('categorias', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nome: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      descricao: {
        type: Sequelize.TEXT
      },
      tipo: {
        type: Sequelize.ENUM('odontologico', 'estetico', 'cirurgico'),
        defaultValue: 'odontologico'
      },
      loja_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'lojas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      data_criacao: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      data_atualizacao: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('categorias', ['loja_id']);
    await queryInterface.addIndex('categorias', ['tipo']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('categorias');
  }
};