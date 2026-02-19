'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('orcamento_itens', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      procedimento_nome: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      procedimento_descricao: {
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
      orcamento_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'orcamentos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      procedimento_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'procedimentos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    await queryInterface.addIndex('orcamento_itens', ['orcamento_id']);
    await queryInterface.addIndex('orcamento_itens', ['procedimento_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('orcamento_itens');
  }
};