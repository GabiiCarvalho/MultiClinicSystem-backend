'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('categorias', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

      nome: { type: Sequelize.STRING(100), allowNull: false },
      descricao: { type: Sequelize.TEXT },
      tipo: {
        type: Sequelize.ENUM('odontologico', 'estetico', 'cirurgico'),
        defaultValue: 'odontologico'
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

    await queryInterface.addIndex('categorias', ['clinica_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('categorias');
  }
};