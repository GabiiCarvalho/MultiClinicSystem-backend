const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PagamentoItem = sequelize.define('PagamentoItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    pagamento_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    agendamento_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    procedimento_nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    procedimento_descricao: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    tableName: 'pagamento_itens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  PagamentoItem.associate = (models) => {
    PagamentoItem.belongsTo(models.Pagamento, { foreignKey: 'pagamento_id', as: 'pagamento' });
    PagamentoItem.belongsTo(models.Agendamento, { foreignKey: 'agendamento_id', as: 'agendamento' });
  };

  return PagamentoItem;
};