'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pagamento_itens', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

      pagamento_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'pagamentos', key: 'id' },
        onDelete: 'CASCADE'
      },

      descricao: { type: Sequelize.STRING(150), allowNull: false },
      quantidade: { type: Sequelize.INTEGER, defaultValue: 1 },
      preco_unitario: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      total: { type: Sequelize.DECIMAL(10, 2), allowNull: false },

      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('pagamento_itens', ['pagamento_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('pagamento_itens');
  }
};