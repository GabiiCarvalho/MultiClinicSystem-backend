'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('agendamento_itens', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nome_procedimento: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      descricao_procedimento: {
        type: Sequelize.TEXT
      },
      preco: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      observacoes: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.ENUM('pendente', 'realizado', 'cancelado'),
        defaultValue: 'pendente'
      },
      agendamento_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'agendamentos',
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

    await queryInterface.addIndex('agendamento_itens', ['agendamento_id']);
    await queryInterface.addIndex('agendamento_itens', ['procedimento_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('agendamento_itens');
  }
};