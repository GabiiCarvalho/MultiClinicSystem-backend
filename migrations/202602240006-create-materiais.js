'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('materiais', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

      nome: { type: Sequelize.STRING(100), allowNull: false },
      descricao: { type: Sequelize.TEXT },
      quantidade: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      unidade: { type: Sequelize.STRING(20), defaultValue: 'un' },
      quantidade_minima: { type: Sequelize.DECIMAL(10, 2), defaultValue: 10 },
      preco_unitario: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },

      categoria: {
        type: Sequelize.ENUM('consumivel', 'instrumental', 'medicamento', 'equipamento'),
        defaultValue: 'consumivel'
      },

      ativo: { type: Sequelize.BOOLEAN, defaultValue: true },

      clinica_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'clinicas', key: 'id' },
        onDelete: 'CASCADE'
      },

      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('materiais', ['clinica_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('materiais');
  }
};