const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Pessoa = sequelize.define('Pessoa', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    senha: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    whatsapp: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    cpf: {
      type: DataTypes.STRING(14),
      allowNull: true,
      unique: true
    },
    endereco: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tipo: {
      type: DataTypes.ENUM('paciente', 'dentista', 'financeiro', 'gestor', 'atendente', 'proprietario'),
      allowNull: false,
      defaultValue: 'paciente'
    },
    cargo: {
      type: DataTypes.ENUM('gestor', 'dentista', 'atendente', 'financeiro', 'proprietario'),
      allowNull: true
    },
    especialidade: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    cro: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true
    },
    biografia: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true
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
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'pessoas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Pessoa.associate = (models) => {
    Pessoa.belongsTo(models.Loja, { 
      foreignKey: 'loja_id', 
      as: 'loja' 
    });
  };

  return Pessoa;
};