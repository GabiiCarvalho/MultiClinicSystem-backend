const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Loja = sequelize.define('Loja', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    endereco: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    cnpj: {
      type: DataTypes.STRING(18),
      allowNull: true,
      unique: true
    },
    ativa: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
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
    tableName: 'lojas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Loja.associate = (models) => {
    Loja.hasMany(models.Pessoa, { 
      foreignKey: 'loja_id', 
      as: 'pessoas' 
    });
  };

  return Loja;
};