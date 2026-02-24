'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('agendamentos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

      paciente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'pessoas', key: 'id' },
        onDelete: 'CASCADE'
      },

      dentista_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'pessoas', key: 'id' },
        onDelete: 'CASCADE'
      },

      data_hora: { type: Sequelize.DATE, allowNull: false },
      data_hora_fim: { type: Sequelize.DATE, allowNull: false },

      procedimento: { type: Sequelize.STRING(100), allowNull: false },
      valor: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },

      status: {
        type: Sequelize.ENUM(
          'pendente_pagamento',
          'agendado',
          'confirmado',
          'em_andamento',
          'concluido',
          'cancelado'
        ),
        defaultValue: 'agendado'
      },

      pago: { type: Sequelize.BOOLEAN, defaultValue: false },

      clinica_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'clinicas', key: 'id' },
        onDelete: 'CASCADE'
      },

      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('agendamentos', ['clinica_id']);
    await queryInterface.addIndex('agendamentos', ['data_hora']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('agendamentos');
  }
};