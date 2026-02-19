'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pessoas', {
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
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      senha: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      telefone: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      whatsapp: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      cpf: {
        type: Sequelize.STRING(14),
        allowNull: true,
        unique: true
      },
      data_nascimento: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      endereco: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      tipo: {
        type: Sequelize.ENUM(
          'paciente', 
          'dentista', 
          'financeiro', 
          'gestor', 
          'atendente', 
          'proprietario'
        ),
        allowNull: false,
        defaultValue: 'paciente'
      },
      cargo: {
        type: Sequelize.ENUM('gestor', 'dentista', 'atendente', 'financeiro', 'proprietario'),
        allowNull: true
      },
      especialidade: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      cro: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },
      biografia: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      convenio: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      numero_convenio: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      alergias: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      medicamentos_continuos: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('pessoas', ['loja_id']);
    await queryInterface.addIndex('pessoas', ['tipo']);
    await queryInterface.addIndex('pessoas', ['email']);
    await queryInterface.addIndex('pessoas', ['cpf']);
    await queryInterface.addIndex('pessoas', ['cro']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('pessoas');
  }
};