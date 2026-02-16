'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('venda_itens', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      item_nome: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      item_descricao: {
        type: Sequelize.TEXT
      },
      quantidade: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      preco_unitario: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      venda_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'vendas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      procedimento_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'procedimentos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      material_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'materiais',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      atualizado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('venda_itens', ['venda_id']);
    await queryInterface.addIndex('venda_itens', ['procedimento_id']);
    await queryInterface.addIndex('venda_itens', ['material_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('venda_itens');
  }
};