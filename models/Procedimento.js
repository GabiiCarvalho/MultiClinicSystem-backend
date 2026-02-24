module.exports = (sequelize, DataTypes) => {
  const Procedimento = sequelize.define('Procedimento', {
    nome: { type: DataTypes.STRING(100), allowNull: false },
    descricao: DataTypes.TEXT,
    preco: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    duracao_minutos: { type: DataTypes.INTEGER, defaultValue: 30 },
    clinica_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'clinicas', key: 'id' }
    }
  }, {
    tableName: 'procedimentos',
    timestamps: true,
    createdAt: 'data_criacao',
    updatedAt: 'data_atualizacao'
  });

  Procedimento.associate = (models) => {
    Procedimento.belongsTo(models.Clinica, { foreignKey: 'clinica_id' });
  };

  return Procedimento;
};