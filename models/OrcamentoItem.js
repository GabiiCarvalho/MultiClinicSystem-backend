module.exports = (sequelize, DataTypes) => {
  const OrcamentoItem = sequelize.define('OrcamentoItem', {
    procedimento_nome: { type: DataTypes.STRING(100), allowNull: false },
    quantidade: { type: DataTypes.INTEGER, defaultValue: 1 },
    preco_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
  }, {
    tableName: 'orcamento_itens',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
  });

  OrcamentoItem.associate = (models) => {
    OrcamentoItem.belongsTo(models.Orcamento, { foreignKey: 'orcamento_id' });
  };

  return OrcamentoItem;
};