const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MaterialMovimentacao = sequelize.define('MaterialMovimentacao', {
    tipo: {
      type: DataTypes.ENUM('entrada', 'saida', 'ajuste'),
      allowNull: false
    },
    quantidade: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    quantidade_anterior: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    quantidade_nova: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    motivo: DataTypes.STRING(255),
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    clinica_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'clinicas', key: 'id' }
    }
  }, {
    tableName: 'material_movimentacoes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  MaterialMovimentacao.associate = (models) => {
    MaterialMovimentacao.belongsTo(models.Material, { foreignKey: 'material_id' });
    MaterialMovimentacao.belongsTo(models.Usuario, { foreignKey: 'usuario_id' });
    MaterialMovimentacao.belongsTo(models.Clinica, { foreignKey: 'clinica_id' });
  };

  return MaterialMovimentacao;
};