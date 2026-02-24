'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dentistas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      pessoa_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pessoas',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },

      cro: {
        type: Sequelize.STRING(20),
        allowNull: false
      },

      especialidade: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      percentual_comissao: {
        type: Sequelize.DECIMAL(5,2),
        defaultValue: 0
      },

      ativo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },

      clinica_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'clinicas',
          key: 'id'
        },
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

    await queryInterface.addIndex('dentistas', ['clinica_id']);
    await queryInterface.addIndex('dentistas', ['pessoa_id']);
    await queryInterface.addIndex('dentistas', ['cro']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('dentistas');
  }
};