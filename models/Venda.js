module.exports = (sequelize, DataTypes) => {
  const Venda = sequelize.define('Venda', {
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    desconto: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    forma_pagamento: DataTypes.STRING,
    clinica_id: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    tableName: 'vendas',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
  });

  Venda.associate = (models) => {
    Venda.belongsTo(models.Clinica, { foreignKey: 'clinica_id' });
    Venda.belongsTo(models.Paciente, { foreignKey: 'paciente_id' });
  };

  return Venda;
};