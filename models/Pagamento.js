const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Pagamento = sequelize.define('Pagamento', {
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    desconto: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    forma_pagamento: {
      type: DataTypes.ENUM('dinheiro', 'pix', 'cartao_debito', 'cartao_credito'),
      allowNull: false
    },
    clinica_id: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    tableName: 'pagamentos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Pagamento.associate = (models) => {
    Pagamento.belongsTo(models.Clinica, { foreignKey: 'clinica_id' });
    Pagamento.belongsTo(models.Paciente, { foreignKey: 'paciente_id' });
  };

  return Pagamento;
};