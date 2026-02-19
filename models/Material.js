const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Material = sequelize.define('Material', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    quantidade: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    unidade: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'un'
    },
    quantidade_minima: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 10
    },
    preco_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    fornecedor: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    categoria: {
      type: DataTypes.ENUM('consumivel', 'instrumental', 'medicamento', 'equipamento'),
      defaultValue: 'consumivel'
    },
    localizacao: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    data_validade: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    lote: {
      type: DataTypes.STRING(50),
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
      allowNull: false
    }
  }, {
    tableName: 'materiais',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Material.associate = (models) => {
    Material.belongsTo(models.Loja, { foreignKey: 'loja_id', as: 'loja' });
    Material.hasMany(models.MaterialMovimentacao, { foreignKey: 'material_id', as: 'movimentacoes' });
  };

  return Material;
};