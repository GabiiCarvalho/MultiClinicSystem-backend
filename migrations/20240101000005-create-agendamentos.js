'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('agendamentos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      paciente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pessoas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      dentista_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pessoas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pessoas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      data_hora: {
        type: Sequelize.DATE,
        allowNull: false
      },
      data_hora_fim: {
        type: Sequelize.DATE,
        allowNull: false
      },
      procedimento: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      procedimento_descricao: {
        type: Sequelize.TEXT,
        allowNull: true
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
      valor: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM(
          'pendente_pagamento', 
          'agendado', 
          'confirmado', 
          'em_andamento', 
          'concluido', 
          'cancelado'
        ),
        defaultValue: 'pendente_pagamento'
      },
      pago: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      pagamento_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      observacoes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      motivo_cancelamento: {
        type: Sequelize.TEXT,
        allowNull: true
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
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('agendamentos', ['loja_id']);
    await queryInterface.addIndex('agendamentos', ['paciente_id']);
    await queryInterface.addIndex('agendamentos', ['dentista_id']);
    await queryInterface.addIndex('agendamentos', ['data_hora']);
    await queryInterface.addIndex('agendamentos', ['status']);
    await queryInterface.addIndex('agendamentos', ['pago']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('agendamentos');
  }
};