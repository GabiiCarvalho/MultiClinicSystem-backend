const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Pagamento = sequelize.define('Pagamento', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    paciente_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    data_pagamento: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    desconto: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    forma_pagamento: {
      type: DataTypes.ENUM('dinheiro', 'pix', 'cartao_debito', 'cartao_credito'),
      allowNull: false
    },
    recebido: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    troco: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('confirmado', 'cancelado'),
      defaultValue: 'confirmado'
    },
    comprovante_path: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    whatsapp_enviado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    loja_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'pagamentos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Pagamento.associate = (models) => {
    Pagamento.belongsTo(models.Loja, { foreignKey: 'loja_id', as: 'loja' });
    Pagamento.belongsTo(models.Pessoa, { foreignKey: 'paciente_id', as: 'paciente' });
    Pagamento.belongsTo(models.Pessoa, { foreignKey: 'usuario_id', as: 'usuario' });
    Pagamento.hasMany(models.PagamentoItem, { foreignKey: 'pagamento_id', as: 'itens' });
  };

  return Pagamento;
};