'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pacientes', {
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
      telefone: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100),
        validate: {
          isEmail: true
        }
      },
      cpf: {
        type: Sequelize.STRING(14),
        unique: true
      },
      data_nascimento: {
        type: Sequelize.DATEONLY
      },
      endereco: {
        type: Sequelize.TEXT
      },
      convenio: {
        type: Sequelize.STRING(100)
      },
      numero_convenio: {
        type: Sequelize.STRING(50)
      },
      alergias: {
        type: Sequelize.TEXT
      },
      medicamentos_continuos: {
        type: Sequelize.TEXT
      },
      observacoes: {
        type: Sequelize.TEXT
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

    await queryInterface.addIndex('pacientes', ['loja_id']);
    await queryInterface.addIndex('pacientes', ['cpf']);
    await queryInterface.addIndex('pacientes', ['telefone']);
    await queryInterface.addIndex('pacientes', ['nome']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('pacientes');
  }
};