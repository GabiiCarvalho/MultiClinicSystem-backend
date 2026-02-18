const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const Loja = sequelize.define('Loja', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false
    },
    endereco: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    telefone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cnpj: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // CNPJ único para cada clínica
    },
    ativa: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'lojas',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
  });

  Loja.associate = function(models) {
    Loja.hasMany(models.Usuario, {
      foreignKey: 'loja_id',
      as: 'usuarios'
    });
    Loja.hasMany(models.Paciente, {
      foreignKey: 'loja_id',
      as: 'pacientes'
    });
    Loja.hasMany(models.Procedimento, {
      foreignKey: 'loja_id',
      as: 'procedimentos'
    });
    Loja.hasMany(models.Agendamento, {
      foreignKey: 'loja_id',
      as: 'agendamentos'
    });
    Loja.hasMany(models.Venda, {
      foreignKey: 'loja_id',
      as: 'vendas'
    });
  };

  return Loja;
};