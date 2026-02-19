'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('materiais', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nome: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      quantidade: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      unidade: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'un'
      },
      quantidade_minima: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 10
      },
      preco_unitario: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      fornecedor: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      categoria: {
        type: Sequelize.ENUM('consumivel', 'instrumental', 'medicamento', 'equipamento'),
        defaultValue: 'consumivel'
      },
      localizacao: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      data_validade: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      lote: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      observacoes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('materiais', ['loja_id']);
    await queryInterface.addIndex('materiais', ['categoria']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('materiais');
  }
};