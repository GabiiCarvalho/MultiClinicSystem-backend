module.exports = (sequelize, DataTypes) => {
  const Categoria = sequelize.define('Categoria', {
    nome: { type: DataTypes.STRING(100), allowNull: false },
    descricao: DataTypes.TEXT,
    tipo: {
      type: DataTypes.ENUM('odontologico', 'estetico', 'cirurgico'),
      defaultValue: 'odontologico'
    },
    clinica_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'clinicas', key: 'id' }
    }
  }, {
    tableName: 'categorias',
    timestamps: true,
    createdAt: 'data_criacao',
    updatedAt: 'data_atualizacao'
  });

  Categoria.associate = (models) => {
    Categoria.belongsTo(models.Clinica, { foreignKey: 'clinica_id' });
    Categoria.hasMany(models.Procedimento, { foreignKey: 'categoria_id' });
  };

  return Categoria;
};