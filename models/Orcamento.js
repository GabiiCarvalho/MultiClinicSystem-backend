module.exports = (sequelize, DataTypes) => {
  const Orcamento = sequelize.define('Orcamento', {
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    desconto: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: {
      type: DataTypes.ENUM('ativo', 'aprovado', 'expirado', 'cancelado'),
      defaultValue: 'ativo'
    },
    clinica_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'orcamentos',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
  });

  Orcamento.associate = (models) => {
    Orcamento.belongsTo(models.Clinica, { foreignKey: 'clinica_id' });
    Orcamento.belongsTo(models.Paciente, { foreignKey: 'paciente_id' });
    Orcamento.hasMany(models.OrcamentoItem, { foreignKey: 'orcamento_id' });
  };

  return Orcamento;
};