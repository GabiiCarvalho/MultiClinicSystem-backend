'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pagamento_itens', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      pagamento_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pagamentos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      agendamento_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'agendamentos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      procedimento_nome: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      procedimento_descricao: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      valor: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('pagamento_itens', ['pagamento_id']);
    await queryInterface.addIndex('pagamento_itens', ['agendamento_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('pagamento_itens');
  }
};