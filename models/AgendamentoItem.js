module.exports = (sequelize, DataTypes) => {
  const AgendamentoItem = sequelize.define('AgendamentoItem', {
    nome_procedimento: { type: DataTypes.STRING(100), allowNull: false },
    descricao_procedimento: DataTypes.TEXT,
    preco: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: {
      type: DataTypes.ENUM('pendente', 'realizado', 'cancelado'),
      defaultValue: 'pendente'
    }
  }, {
    tableName: 'agendamento_itens',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
  });

  AgendamentoItem.associate = (models) => {
    AgendamentoItem.belongsTo(models.Agendamento, { foreignKey: 'agendamento_id' });
    AgendamentoItem.belongsTo(models.Procedimento, { foreignKey: 'procedimento_id' });
  };

  return AgendamentoItem;
};