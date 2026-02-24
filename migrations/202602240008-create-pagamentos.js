'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pagamentos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

      paciente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'pessoas', key: 'id' },
        onDelete: 'CASCADE'
      },

      subtotal: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      desconto: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      total: { type: Sequelize.DECIMAL(10, 2), allowNull: false },

      forma_pagamento: {
        type: Sequelize.ENUM('dinheiro', 'pix', 'cartao_debito', 'cartao_credito'),
        allowNull: false
      },

      status: {
        type: Sequelize.ENUM('confirmado', 'cancelado'),
        defaultValue: 'confirmado'
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

    await queryInterface.addIndex('pagamentos', ['clinica_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('pagamentos');
  }
};