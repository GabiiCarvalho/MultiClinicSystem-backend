module.exports = (sequelize, DataTypes) => {
  const PagamentoItem = sequelize.define('PagamentoItem', {
    descricao: {
      type: DataTypes.STRING(150),
      allowNull: false
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
    tableName: 'pagamento_itens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  PagamentoItem.associate = (models) => {
    PagamentoItem.belongsTo(models.Pagamento, { foreignKey: 'pagamento_id' });
  };

  return PagamentoItem;
};