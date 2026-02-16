module.exports = (sequelize, DataTypes) => {
  const Material = sequelize.define('Material', {
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    descricao: {
      type: DataTypes.TEXT
    },
    quantidade: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    unidade: {
      type: DataTypes.STRING(20),
      defaultValue: 'un'
    },
    quantidade_minima: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 10
    },
    preco_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    fornecedor: {
      type: DataTypes.STRING(100)
    },
    categoria: {
      type: DataTypes.ENUM('consumivel', 'instrumental', 'medicamento'),
      defaultValue: 'consumivel'
    }
  }, {
    tableName: 'materiais',
    timestamps: true,
    createdAt: 'data_criacao',
    updatedAt: 'data_atualizacao'
  });

  Material.associate = (models) => {
    Material.belongsTo(models.Loja, { 
      foreignKey: 'loja_id',
      as: 'loja' 
    });
    Material.hasMany(models.VendaItem, {
      foreignKey: 'material_id',
      as: 'vendaItens'
    });
  };

  return Material;
};