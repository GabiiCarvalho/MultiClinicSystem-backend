const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const Usuario = sequelize.define('Usuario', {
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    senha_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cargo: {
      type: DataTypes.ENUM('proprietario', 'gestor', 'dentista', 'atendente', 'financeiro'),
      allowNull: false,
      defaultValue: 'atendente'
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    loja_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'lojas',
        key: 'id'
      }
    },
    especialidade: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cro: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    }
  }, {
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
  });

  Usuario.associate = function(models) {
    Usuario.belongsTo(models.Loja, {
      foreignKey: 'loja_id',
      as: 'loja'
    });
    Usuario.hasMany(models.Agendamento, {
      foreignKey: 'dentista_id',
      as: 'agendamentos'
    });
    Usuario.hasMany(models.Agendamento, {
      foreignKey: 'usuario_id',
      as: 'agendamentos_criados'
    });
    Usuario.hasMany(models.Venda, {
      foreignKey: 'usuario_id',
      as: 'vendas'
    });
  };

  return Usuario;
};