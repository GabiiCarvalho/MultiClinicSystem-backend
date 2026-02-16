module.exports = (sequelize, DataTypes) => {
  const Orcamento = sequelize.define('Orcamento', {
    data: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    validade: {
      type: DataTypes.DATE
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
    status: {
      type: DataTypes.ENUM('ativo', 'aprovado', 'expirado', 'cancelado'),
      defaultValue: 'ativo'
    },
    observacoes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'orcamentos',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
  });

  Orcamento.associate = (models) => {
    Orcamento.belongsTo(models.Loja, { 
      foreignKey: 'loja_id',
      as: 'loja' 
    });
    Orcamento.belongsTo(models.Paciente, { 
      foreignKey: 'paciente_id',
      as: 'paciente' 
    });
    Orcamento.belongsTo(models.Usuario, { 
      foreignKey: 'usuario_id',
      as: 'usuario' 
    });
    Orcamento.hasMany(models.OrcamentoItem, { 
      foreignKey: 'orcamento_id',
      as: 'itens' 
    });
  };

  return Orcamento;
};