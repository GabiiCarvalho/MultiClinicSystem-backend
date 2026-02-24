'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('material_movimentacoes', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

      material_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'materiais', key: 'id' },
        onDelete: 'CASCADE'
      },

      tipo: {
        type: Sequelize.ENUM('entrada', 'saida', 'ajuste'),
        allowNull: false
      },

      quantidade: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      quantidade_anterior: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      quantidade_nova: { type: Sequelize.DECIMAL(10, 2), allowNull: false },

      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'pessoas', key: 'id' },
        onDelete: 'CASCADE'
      },

      clinica_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'clinicas', key: 'id' },
        onDelete: 'CASCADE'
      },

      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('material_movimentacoes', ['clinica_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('material_movimentacoes');
  }
};