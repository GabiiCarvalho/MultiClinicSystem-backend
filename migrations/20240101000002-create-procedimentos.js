'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('procedimentos', {
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
        type: Sequelize.TEXT
      },
      preco: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      duracao_minutos: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      tipo: {
        type: Sequelize.ENUM('odontologico', 'estetico', 'cirurgico'),
        defaultValue: 'odontologico'
      },
      observacoes: {
        type: Sequelize.TEXT
      },
      categoria_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'categorias',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
      data_criacao: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      data_atualizacao: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('procedimentos', ['loja_id']);
    await queryInterface.addIndex('procedimentos', ['categoria_id']);
    await queryInterface.addIndex('procedimentos', ['ativo']);
    await queryInterface.addIndex('procedimentos', ['tipo']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('procedimentos');
  }
};