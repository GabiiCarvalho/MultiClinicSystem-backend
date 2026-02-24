'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pessoas', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nome: { type: Sequelize.STRING(150), allowNull: false },
      email: { type: Sequelize.STRING(150), allowNull: false },
      senha: { type: Sequelize.STRING(255) },
      telefone: { type: Sequelize.STRING(20) },
      cpf: { type: Sequelize.STRING(14) },
      tipo: {
        type: Sequelize.ENUM(
          'paciente',
          'dentista',
          'gestor',
          'atendente',
          'financeiro',
          'proprietario'
        ),
        allowNull: false,
        defaultValue: 'paciente'
      },
      cargo: {
        type: Sequelize.ENUM(
          'gestor',
          'dentista',
          'atendente',
          'financeiro',
          'proprietario'
        )
      },
      especialidade: { type: Sequelize.STRING(100) },
      cro: { type: Sequelize.STRING(20) },
      ativo: { type: Sequelize.BOOLEAN, defaultValue: true },
      clinica_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'clinicas', key: 'id' },
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('pessoas', ['clinica_id']);
    await queryInterface.addIndex('pessoas', ['email']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('pessoas');
  }
};