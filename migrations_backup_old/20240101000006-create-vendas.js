'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vendas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      data_hora: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      desconto: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      forma_pagamento: {
        type: Sequelize.ENUM('dinheiro', 'pix', 'cartao_debito', 'cartao_credito', 'convenio'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pendente', 'pago', 'cancelado'),
        defaultValue: 'pago'
      },
      observacoes: {
        type: Sequelize.TEXT
      },
      parcelas: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      paciente_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'pacientes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      agendamento_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'agendamentos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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

    await queryInterface.addIndex('vendas', ['loja_id']);
    await queryInterface.addIndex('vendas', ['paciente_id']);
    await queryInterface.addIndex('vendas', ['data_hora']);
    await queryInterface.addIndex('vendas', ['forma_pagamento']);
    await queryInterface.addIndex('vendas', ['status']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('vendas');
  }
};