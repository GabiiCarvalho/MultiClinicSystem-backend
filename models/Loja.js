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
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    endereco: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    telefone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    cnpj: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
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
    Loja.hasMany(models.Categoria, {
      foreignKey: 'loja_id',
      as: 'categorias'
    });
    Loja.hasMany(models.Agendamento, {
      foreignKey: 'loja_id',
      as: 'agendamentos'
    });
    Loja.hasMany(models.Venda, {
      foreignKey: 'loja_id',
      as: 'vendas'
    });
    Loja.hasMany(models.Material, {
      foreignKey: 'loja_id',
      as: 'materiais'
    });
  };

  return Loja;
};