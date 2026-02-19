const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MaterialMovimentacao = sequelize.define('MaterialMovimentacao', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    material_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tipo: {
      type: DataTypes.ENUM('entrada', 'saida', 'ajuste'),
      allowNull: false
    },
    quantidade: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    quantidade_anterior: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    quantidade_nova: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    motivo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    agendamento_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    loja_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'material_movimentacoes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  MaterialMovimentacao.associate = (models) => {
    MaterialMovimentacao.belongsTo(models.Loja, { foreignKey: 'loja_id', as: 'loja' });
    MaterialMovimentacao.belongsTo(models.Material, { foreignKey: 'material_id', as: 'material' });
    MaterialMovimentacao.belongsTo(models.Pessoa, { foreignKey: 'usuario_id', as: 'usuario' });
    MaterialMovimentacao.belongsTo(models.Agendamento, { foreignKey: 'agendamento_id', as: 'agendamento' });
  };

  return MaterialMovimentacao;
};