'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('materiais', {
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
      quantidade: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      unidade: {
        type: Sequelize.STRING(20),
        defaultValue: 'un'
      },
      quantidade_minima: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 10
      },
      preco_unitario: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      fornecedor: {
        type: Sequelize.STRING(100)
      },
      categoria: {
        type: Sequelize.ENUM('consumivel', 'instrumental', 'medicamento'),
        defaultValue: 'consumivel'
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

    await queryInterface.addIndex('materiais', ['loja_id']);
    await queryInterface.addIndex('materiais', ['categoria']);
    await queryInterface.addIndex('materiais', ['quantidade']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('materiais');
  }
};