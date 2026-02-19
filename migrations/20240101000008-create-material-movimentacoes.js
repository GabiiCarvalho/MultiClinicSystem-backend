'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('material_movimentacoes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      material_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'materiais',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tipo: {
        type: Sequelize.ENUM('entrada', 'saida', 'ajuste'),
        allowNull: false
      },
      quantidade: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      quantidade_anterior: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      quantidade_nova: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      motivo: {
        type: Sequelize.STRING(255),
        allowNull: true
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
      observacoes: {
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
      }
    });

    await queryInterface.addIndex('material_movimentacoes', ['material_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('material_movimentacoes');
  }
};