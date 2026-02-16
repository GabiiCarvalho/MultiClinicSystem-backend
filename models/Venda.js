module.exports = (sequelize, DataTypes) => {
  const Venda = sequelize.define('Venda', {
    data_hora: {
      type: DataTypes.DATE,
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
      type: DataTypes.ENUM('dinheiro', 'pix', 'cartao_debito', 'cartao_credito', 'convenio'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pendente', 'pago', 'cancelado'),
      defaultValue: 'pago'
    },
    observacoes: {
      type: DataTypes.TEXT
    },
    parcelas: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  }, {
    tableName: 'vendas',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
  });

  Venda.associate = (models) => {
    Venda.belongsTo(models.Loja, { 
      foreignKey: 'loja_id',
      as: 'loja' 
    });
    Venda.belongsTo(models.Paciente, { 
      foreignKey: 'paciente_id',
      as: 'paciente' 
    });
    Venda.belongsTo(models.Usuario, { 
      foreignKey: 'usuario_id',
      as: 'usuario' 
    });
    Venda.belongsTo(models.Agendamento, { 
      foreignKey: 'agendamento_id',
      as: 'agendamento' 
    });
    Venda.hasMany(models.VendaItem, { 
      foreignKey: 'venda_id',
      as: 'itens' 
    });
  };

  return Venda;
};