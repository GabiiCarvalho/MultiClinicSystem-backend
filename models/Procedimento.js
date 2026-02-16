module.exports = (sequelize, DataTypes) => {
  const Procedimento = sequelize.define('Procedimento', {
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    descricao: {
      type: DataTypes.TEXT
    },
    preco: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    duracao_minutos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'procedimentos',
    timestamps: true,
    createdAt: 'data_criacao',
    updatedAt: 'data_atualizacao'
  });

  Procedimento.associate = (models) => {
    Procedimento.belongsTo(models.Loja, { foreignKey: 'loja_id', as: 'loja' });
    Procedimento.belongsTo(models.Categoria, { foreignKey: 'categoria_id', as: 'categoria' });
    Procedimento.hasMany(models.AgendamentoItem, { foreignKey: 'procedimento_id', as: 'agendamentoItens' });
  };

  return Procedimento;
};