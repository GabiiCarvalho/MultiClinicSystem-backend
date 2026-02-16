module.exports = (sequelize, DataTypes) => {
  const VendaItem = sequelize.define('VendaItem', {
    item_nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    item_descricao: {
      type: DataTypes.TEXT
    },
    quantidade: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    preco_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    tableName: 'venda_itens',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
  });

  VendaItem.associate = (models) => {
    VendaItem.belongsTo(models.Venda, { 
      foreignKey: 'venda_id',
      as: 'venda' 
    });
    VendaItem.belongsTo(models.Procedimento, { 
      foreignKey: 'procedimento_id',
      as: 'procedimento' 
    });
    VendaItem.belongsTo(models.Material, { 
      foreignKey: 'material_id',
      as: 'material' 
    });
  };

  return VendaItem;
};